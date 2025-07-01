<!-- src/pages/dashboard/UserManagement.vue -->
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

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.email" placeholder="输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
            <el-option label="正常" :value="0"></el-option>
            <el-option label="封禁" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchUsers">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="userList" v-loading="loading" style="width: 100%" border>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column label="角色">
          <template #default="scope">
            <el-tag
              v-for="role in scope.row.roles.split(',')"
              :key="role"
              size="small"
              type="info"
              style="margin-right: 5px;"
            >
              {{ getRoleDisplayName(role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
              {{ scope.row.status === 0 ? '正常' : '封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="warning" size="small" @click="handleChangeRole(scope.row)">改角色</el-button>
            <el-button link type="info" size="small" @click="handleChangePassword(scope.row)">改密码</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

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
    </el-card>

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
    <AdminChangePasswordDialog
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
import { ref, onMounted, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router'; // 引入 useRouter
import { useUserStore } from '@/stores/user';
import * as userService from '@/api/user';
import type { User } from '@/models/entity/User';

// 导入拆分后的组件
import EditUserDialog from '@/components/user/EditUserDialog.vue';
import ChangeRoleDialog from '@/components/user/ChangeRoleDialog.vue';
import AdminChangePasswordDialog from '@/components/user/AdminChangePasswordDialog.vue';
import ExportUsersDialog from '@/components/user/ExportUsersDialog.vue';

const userStore = useUserStore();
const router = useRouter(); // 获取 router 实例

const loading = ref(false);
const userList = ref<User[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalUsers = ref(0);

// 搜索表单
const searchForm = reactive({
  username: '',
  email: '',
  status: null as number | null,
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

// 格式化日期时间的辅助函数
const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleString();
};

// 获取角色显示名称
const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'ROLE_ADMIN': return '管理员';
    case 'ROLE_USER': return '普通用户';
    default: return role;
  }
};

// --- API 调用函数 ---

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value - 1, // 后端分页通常从0开始
      size: pageSize.value,
      username: searchForm.username || undefined,
      email: searchForm.email || undefined,
      status: searchForm.status ?? undefined,
    };
    const res = await userService.getAllUsers(params);
    if (res.code === 200 && res.data) {
      userList.value = res.data.records;
      totalUsers.value = res.data.total;
    } else {
      ElMessage.error(res?.message || '获取用户列表失败！');
    }
  } catch (error: any) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('网络错误，无法获取用户列表！');
  } finally {
    loading.value = false;
  }
};

// 搜索用户
const searchUsers = () => {
  currentPage.value = 1;
  fetchUserList();
};

// 重置搜索
const resetSearch = () => {
  searchForm.username = '';
  searchForm.email = '';
  searchForm.status = null;
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
  currentOperateUser.value = { ...user }; // 复制一份用户数据传递，避免直接修改
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

    await userService.exportAllUsers(fileName, searchForm.status); // 可以根据搜索条件导出
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
  // 可以根据需要执行一些操作，例如刷新列表等
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
