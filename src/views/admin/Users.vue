<!-- src/views/dashboard/Users.vue -->
<template>
  <div class="user-management-container">
    <el-card class="user-management-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" @click="handleExportAllUsers" v-if="isAdmin">导出所有用户</el-button>
          <el-button type="success" @click="showExportDialog = true" v-if="isAdmin">选择字段导出</el-button>
        </div>
      </template>

      <UserSearchForm
          v-model="searchForm"
          @search="searchUsers"
          @reset="resetSearch"
      />

      <UserTable
          :userList="userList"
          :loading="loading"
          @edit="handleEdit"
          @change-role="handleChangeRole"
          @change-password="handleChangePassword"
          @delete="handleDelete"
      />
    </el-card>

      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalUsers"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="pagination-container"
      />

    <!-- 编辑用户弹窗组件 -->
    <EditUserDialog
        :visible="showEditDialog"
        :user-data="currentOperateUser"
        @update:visible="showEditDialog = $event"
        @userUpdated="fetchUserList"
    />

    <!-- 更改角色弹窗组件 -->
    <ChangeRoleDialog
        :visible="showChangeRoleDialog"
        :user-data="currentOperateUser"
        @update:visible="showChangeRoleDialog = $event"
        @roleChanged="fetchUserList"
    />

    <!-- 管理员更改密码弹窗组件 -->
    <ChangePasswordForcefullyDialog
        :visible="showChangePasswordDialog"
        :user-data="currentOperateUser"
        @update:visible="showChangePasswordDialog = $event"
        @passwordChanged="fetchUserList"
    />

    <!-- 导出用户弹窗组件 -->
    <ExportUsersDialog
        :visible="showExportDialog"
        @update:visible="showExportDialog = $event"
        @exported="handleExported"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import * as userService from '@/api/user';
import * as userExportService from '@/api/userExport';
import type { User } from '@/models/entity/User';
import type { UserSearchRequest } from '@/models/request/user/UserSearchRequest';
import EditUserDialog from '@/components/user/operations/EditUserDialog.vue';
import ChangeRoleDialog from '@/components/user/operations/admin/ChangeRoleDialog.vue';
import ChangePasswordForcefullyDialog from '@/components/user/operations/admin/ChangePasswordForcefullyDialog.vue';
import ExportUsersDialog from '@/components/user/operations/admin/ExportUsersDialog.vue';
import type {PageRequest} from "@/models/request/PageRequest.ts";
import UserTable from "@/components/user/operations/admin/UserTable.vue";
import UserSearchForm from "@/components/user/operations/admin/UserSearchForm.vue";

const userStore = useUserStore();
const router = useRouter(); // 获取 router 实例

const loading = ref(false);
const userList = ref<User[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalUsers = ref(0);

// 搜索表单
const searchForm = ref<UserSearchRequest>({
  username: undefined,
  phoneNumber: undefined,
  email: undefined,
  gender: undefined,
  status: undefined,
  roles: undefined,
  loginTime: undefined,
  loginIp: undefined,
  passwordResetTime: undefined,
  createTime: undefined,
  createTimeStart: undefined,
  createTimeEnd: undefined,
  updateTime: undefined,
  updateTimeStart: undefined,
  updateTimeEnd: undefined,
});

// 管理员权限判断
const isAdmin = computed(() => {
  if (userStore.userInfo && userStore.userInfo.roles) {
    return userStore.userInfo.roles.split(',').includes('ROLE_ADMIN');
  }
  return false;
});

// 控制弹窗显示状态
const showEditDialog = ref(false);
const showChangeRoleDialog = ref(false);
const showChangePasswordDialog = ref(false);
const showExportDialog = ref(false);

// 用于传递给子组件的当前操作用户数据
const currentOperateUser = ref<User | null>(null);

// --- API 调用函数 ---

// 获取全部用户列表（无分页）
const fetchUserList = async () => {
  loading.value = true;
  try {
    const res = await userService.getAllUsers({
      pageNum: 1,
      pageSize: 9999, // 设置一个足够大的分页参数获取全部
    });

    if (res.code === 200 && res.data?.records) {
      userList.value = res.data.records;
      totalUsers.value = res.data.total;
    } else {
      ElMessage.error(res?.message || '获取全部用户失败');
    }
  } catch (error) {
    ElMessage.error('网络错误，无法获取用户列表');
  } finally {
    loading.value = false;
  }
};

// 分页+条件搜索用户
const searchUsers = async () => {
  loading.value = true;
  try {
    const pageParams: PageRequest = {
      pageNum: currentPage.value - 1,
      pageSize: pageSize.value,
    };

    // 使用完整的 searchForm.value 传给接口
    const res = await userService.searchUsers(searchForm.value, pageParams);
    if (res.code === 200 && res.data) {
      userList.value = res.data.records;
      totalUsers.value = res.data.total;
    } else {
      ElMessage.error(res?.message || '搜索用户失败');
    }
  } catch (error) {
    ElMessage.error('网络错误，无法搜索用户');
  } finally {
    loading.value = false;
  }
};


// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    username: undefined,
    phoneNumber: undefined,
    email: undefined,
    gender: undefined,
    status: undefined,
    roles: undefined,
    loginTime: undefined,
    loginIp: undefined,
    passwordResetTime: undefined,
    createTime: undefined,
    createTimeStart: undefined,
    createTimeEnd: undefined,
    updateTime: undefined,
    updateTimeStart: undefined,
    updateTimeEnd: undefined,
  };
  currentPage.value = 1;
  fetchUserList();
};


// 处理分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchUserList();
};

// 处理当前页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchUserList();
};

// --- 用户操作 ---

// 编辑用户
const handleEdit = (user: User) => {
  currentOperateUser.value = { ...user }; // 复制一份，避免直接修改
  showEditDialog.value = true;
};

// 更改角色
const handleChangeRole = (user: User) => {
  currentOperateUser.value = { ...user };
  showChangeRoleDialog.value = true;
};

// 更改密码 (管理员重置)
const handleChangePassword = (user: User) => {
  currentOperateUser.value = { ...user };
  showChangePasswordDialog.value = true;
};

// 删除用户
const handleDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${user.username}" 吗？此操作不可逆！`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    if (user.id === userStore.userInfo?.id) {
      ElMessage.warning('不能删除当前登录的管理员账户！');
      return;
    }
    const res = await userService.deleteUser(user.id!);
    if (res.code === 200) {
      ElMessage.success('用户删除成功！');
      fetchUserList();
    } else {
      ElMessage.error(res.message || '删除用户失败！');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error);
      ElMessage.error('网络错误或取消操作！');
    }
  }
};

// --- 导出功能 ---

// 导出所有用户
const handleExportAllUsers = async () => {
  try {
    const result = await ElMessageBox.prompt('请输入导出文件名:', '导出所有用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: '所有用户数据',
      inputPattern: /.+/,
      inputErrorMessage: '文件名不能为空',
    });
    const fileName = result.value || '所有用户数据';

    await userExportService.exportAllUsers(fileName, searchForm.value.status); // 可以根据搜索条件导出
    ElMessage.success('所有用户数据已开始导出！');
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('导出所有用户失败:', error);
      ElMessage.error('导出失败，请重试！');
    }
  }
};

// 导出弹窗关闭或导出成功后的回调
const handleExported = () => {
  console.log('用户数据导出操作完成。');
};

// 组件挂载时获取用户列表
onMounted(() => {
  if (isAdmin.value) {
    fetchUserList();
  } else {
    ElMessage.warning('您没有权限访问用户管理模块。');
    router.push('/');
  }
});
</script>

<style scoped>
.user-management-container {
  padding: 0px; /* 由父级el-main控制 */
}

.user-management-card {
  width: 100%;
  box-shadow: none; /* 移除内层卡片的阴影 */
  border: none; /* 移除内层卡片的边框 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
}

.search-form {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  justify-content: flex-end; /* 右对齐分页组件 */
  display: flex;
}

/* 对话框底部按钮的样式 */
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>
