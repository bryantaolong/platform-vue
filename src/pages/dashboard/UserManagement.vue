<template>
  <div class="user-management-container">
    <el-card class="user-management-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" @click="handleExportAllUsers" v-if="isAdmin">导出所有用户</el-button>
          <el-button type="success" @click="handleExportUsersWithSelection" v-if="isAdmin">选择字段导出</el-button>
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
        <el-table-column prop="roles" label="角色"></el-table-column>
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

    <el-dialog
      v-model="editDialogVisible"
      :title="currentEditUser.id ? '编辑用户' : '新增用户'"
      width="500px"
    >
      <el-form :model="currentEditUser" :rules="editUserRules" ref="editUserFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="currentEditUser.username" :disabled="!!currentEditUser.id"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="currentEditUser.email"></el-input>
        </el-form-item>
        </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditUser">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="changeRoleDialogVisible" title="更改用户角色" width="400px">
      <el-form :model="currentChangeRoleUser" ref="changeRoleFormRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="currentChangeRoleUser.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="新角色" prop="newRoles">
          <el-input v-model="currentChangeRoleUser.newRoles" placeholder="多个角色用逗号分隔，如ROLE_USER,ROLE_ADMIN"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="changeRoleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitChangeRole">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="changePasswordDialogVisible" title="更改用户密码" width="450px">
      <el-form :model="changePasswordForm" :rules="changePasswordRules" ref="changePasswordFormRef" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="currentChangePasswordUser.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input type="password" v-model="changePasswordForm.newPassword" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmNewPassword">
          <el-input type="password" v-model="changePasswordForm.confirmNewPassword" show-password></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="changePasswordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitChangePassword">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="exportDialogVisible" title="选择导出字段" width="500px">
      <el-form label-width="100px">
        <el-form-item label="导出文件名">
          <el-input v-model="exportFileName" placeholder="默认为用户数据"></el-input>
        </el-form-item>
        <el-form-item label="状态筛选">
          <el-select v-model="exportStatusFilter" placeholder="选择状态" clearable>
            <el-option label="正常" :value="0"></el-option>
            <el-option label="封禁" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择字段">
          <el-checkbox-group v-model="selectedExportFields">
            <el-checkbox v-for="(label, key) in exportFieldsOptions" :key="key" :label="key">
              {{ label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="exportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmExport">导出</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus';
import { useUserStore } from '@/stores/user'; // 假设你需要用户信息，例如判断是否是管理员
import * as userService from '@/api/user'; // 导入用户服务的所有API
import type { User } from '@/models/entity/User';
import type { UserUpdateRequest } from '@/models/request/UserUpdateRequest'; // 导入 UserUpdateRequest
import type { ChangePasswordRequest } from '@/models/request/ChangePasswordRequest'; // 导入 ChangePasswordRequest
import type { UserExportRequest } from '@/models/request/UserExportRequest'; // 导入 UserExportRequest

const userStore = useUserStore();
const loading = ref(false);
const userList = ref<User[]>([]); // 用户列表数据
const currentPage = ref(1); // 当前页码
const pageSize = ref(10); // 每页条数
const totalUsers = ref(0); // 用户总数

// 搜索表单
const searchForm = reactive({
  username: '',
  email: '',
  status: null as number | null,
});

// 管理员权限判断 (与Home.vue中类似)
const isAdmin = computed(() => {
  if (userStore.userInfo && userStore.userInfo.roles) {
    return userStore.userInfo.roles.split(',').includes('ROLE_ADMIN');
  }
  return false;
});

// 编辑用户相关
const editDialogVisible = ref(false);
const currentEditUser = reactive<UserUpdateRequest & { id?: number | null }>({ // 联合 UserUpdateRequest 和 id
  id: null,
  username: '',
  email: '',
  // password: '' // 如果新增用户需要密码，在这里添加
});
const editUserFormRef = ref<FormInstance>(); // 表单实例引用
const editUserRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 15, message: '用户名长度在 3 到 15 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
  ],
  // password: [ // 如果新增用户需要密码
  //   { required: true, message: '请输入密码', trigger: 'blur' },
  //   { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  // ]
});

// 更改角色相关
const changeRoleDialogVisible = ref(false);
const currentChangeRoleUser = reactive<{ id: number | null; username: string; newRoles: string }>({
  id: null,
  username: '',
  newRoles: ''
});
const changeRoleFormRef = ref<FormInstance>();

// 更改密码相关
const changePasswordDialogVisible = ref(false);
const currentChangePasswordUser = reactive<{ id: number | null; username: string }>({
  id: null,
  username: '',
});
const changePasswordForm = reactive({
  oldPassword: '', // 实际上这里只需要新密码，旧密码是用户自己修改时用的，管理员修改不需要旧密码
  newPassword: '',
  confirmNewPassword: ''
});
const changePasswordFormRef = ref<FormInstance>();
const changePasswordRules = reactive({
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmNewPassword: [
    {
      required: true,
      validator: (rule: any, value: string, callback: any) => {
        if (value === '') {
          callback(new Error('请再次输入新密码'));
        } else if (value !== changePasswordForm.newPassword) {
          callback(new Error('两次输入的密码不一致!'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
});

// 导出功能相关
const exportDialogVisible = ref(false);
const exportFileName = ref('用户数据');
const exportStatusFilter = ref<number | null>(null);
const selectedExportFields = ref<string[]>([]); // 存储用户选择的导出字段
const exportFieldsOptions = ref<Map<string, string>>(new Map()); // 存储后端返回的可导出字段及中文名

// 格式化日期时间的辅助函数 (与Home.vue中的相同)
const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleString();
};

// --- API 调用函数 ---

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true;
  try {
    // 假设 getAllUsers 方法支持分页和搜索参数
    // 后端 getAllUsers() 返回的是 Result<Page<User>>
    // 如果后端 getAllUsers 没有分页参数，你需要根据实际后端 API 调整
    // 假设后端支持传入currentPage, pageSize, username, email, status作为查询参数
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      username: searchForm.username || undefined, // undefined 不会发送该参数
      email: searchForm.email || undefined,
      status: searchForm.status ?? undefined, // null 和 undefined 都不会发送
    };
    const res = await userService.getAllUsers(params); // 需要修改userService.getAllUsers来支持参数
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
  currentPage.value = 1; // 搜索时重置回第一页
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
  editDialogVisible.value = true;
  currentEditUser.id = user.id;
  currentEditUser.username = user.username;
  currentEditUser.email = user.email;
  // 重置表单校验状态
  if (editUserFormRef.value) {
    editUserFormRef.value.clearValidate();
  }
};

// 提交编辑用户
const submitEditUser = async () => {
  if (!editUserFormRef.value) return;
  await editUserFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (currentEditUser.id) { // 更新用户
          const updateData: UserUpdateRequest = {
            username: currentEditUser.username,
            email: currentEditUser.email
          };
          const res = await userService.updateUser(currentEditUser.id, updateData);
          if (res.code === 200) {
            ElMessage.success('用户信息更新成功！');
            editDialogVisible.value = false;
            fetchUserList(); // 刷新列表
          } else {
            ElMessage.error(res.message || '更新失败！');
          }
        } else { // 新增用户 (此模块目前不包含新增，但可扩展)
          ElMessage.warning('当前模块不支持新增用户，请通过注册功能创建用户。');
          // const res = await userService.register(currentEditUser as RegisterRequest);
          // if (res.code === 200) {
          //   ElMessage.success('用户新增成功！');
          //   editDialogVisible.value = false;
          //   fetchUserList();
          // } else {
          //   ElMessage.error(res.message || '新增失败！');
          // }
        }
      } catch (error: any) {
        console.error('更新/新增用户失败:', error);
        ElMessage.error('网络错误或请求失败！');
      }
    } else {
      ElMessage.error('请检查表单输入！');
      return false;
    }
  });
};

// 更改角色
const handleChangeRole = (user: User) => {
  changeRoleDialogVisible.value = true;
  currentChangeRoleUser.id = user.id;
  currentChangeRoleUser.username = user.username;
  currentChangeRoleUser.newRoles = user.roles; // 默认显示当前角色
  if (changeRoleFormRef.value) {
    changeRoleFormRef.value.clearValidate();
  }
};

// 提交更改角色
const submitChangeRole = async () => {
  if (!changeRoleFormRef.value) return;
  // 这里没有复杂的校验，直接提交
  try {
    if (currentChangeRoleUser.id) {
      const res = await userService.changeRole(currentChangeRoleUser.id, currentChangeRoleUser.newRoles);
      if (res.code === 200) {
        ElMessage.success('用户角色更新成功！');
        changeRoleDialogVisible.value = false;
        fetchUserList();
      } else {
        ElMessage.error(res.message || '更新角色失败！');
      }
    }
  } catch (error: any) {
    console.error('更新角色失败:', error);
    ElMessage.error('网络错误或请求失败！');
  }
};

// 更改密码
const handleChangePassword = (user: User) => {
  changePasswordDialogVisible.value = true;
  currentChangePasswordUser.id = user.id;
  currentChangePasswordUser.username = user.username;
  changePasswordForm.newPassword = '';
  changePasswordForm.confirmNewPassword = '';
  if (changePasswordFormRef.value) {
    changePasswordFormRef.value.clearValidate();
  }
};

// 提交更改密码
const submitChangePassword = async () => {
  if (!changePasswordFormRef.value) return;
  await changePasswordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (currentChangePasswordUser.id) {
          // 注意：后端 changePassword 接口需要 oldPassword，但管理员修改无需旧密码
          // 这里假设 userService.changePassword 在管理员调用时 oldPassword 可以为空或忽略
          // 或者，你可以为管理员提供一个单独的“重置密码”接口，不需要旧密码
          const changePasswordData: ChangePasswordRequest = {
            oldPassword: '', // 管理员操作时可为空或根据实际后端要求
            newPassword: changePasswordForm.newPassword
          };
          const res = await userService.changePassword(currentChangePasswordUser.id, changePasswordData);
          if (res.code === 200) {
            ElMessage.success('用户密码重置成功！');
            changePasswordDialogVisible.value = false;
            fetchUserList();
          } else {
            ElMessage.error(res.message || '重置密码失败！');
          }
        }
      } catch (error: any) {
        console.error('重置密码失败:', error);
        ElMessage.error('网络错误或请求失败！');
      }
    } else {
      ElMessage.error('请检查表单输入！');
      return false;
    }
  });
};

// 删除用户
const handleDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${user.username}" 吗？此操作不可逆！`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    if (user.id === userStore.userInfo?.id) { // 防止管理员删除自己
      ElMessage.warning('不能删除当前登录的管理员账户！');
      return;
    }
    const res = await userService.deleteUser(user.id!); // user.id 是 Long 类型，TypeScript 需要非空断言
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

// 获取可导出字段列表
const fetchExportFields = async () => {
  try {
    const res = await userService.getExportFields();
    if (res.code === 200 && res.data) {
      exportFieldsOptions.value = new Map(Object.entries(res.data)); // 将对象转换为Map
      selectedExportFields.value = Array.from(exportFieldsOptions.value.keys()); // 默认全选
    } else {
      ElMessage.error(res?.message || '获取导出字段失败！');
    }
  } catch (error: any) {
    console.error('获取导出字段失败:', error);
    ElMessage.error('网络错误，无法获取导出字段！');
  }
};

// 导出所有用户（带状态过滤和文件名）
const handleExportAllUsers = async () => {
  try {
    // 假设你可以让用户选择状态和文件名
    const result = await ElMessageBox.prompt('请输入导出文件名:', '导出所有用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: '所有用户数据', // 默认文件名
        inputPattern: /.+/,
        inputErrorMessage: '文件名不能为空',
    });
    const fileName = result.value || '所有用户数据';

    // 假设你可以在这里让用户选择状态，或者直接不带状态
    // const statusChoice = await ElMessageBox.confirm('是否筛选状态为正常的用户？', '状态筛选', {
    //   confirmButtonText: '是',
    //   cancelButtonText: '否',
    //   type: 'info',
    // }).then(() => 0).catch(() => undefined); // 0为正常，undefined为不筛选

    // 直接调用后端接口，后端会处理HttpServletResponse
    // 注意：这里的 userService.exportAllUsers 需要修改以接受参数并触发下载
    await userService.exportAllUsers(fileName, exportStatusFilter.value); // 这里的参数需要根据你的userService.exportAllUsers方法调整
    ElMessage.success('所有用户数据已开始导出！');
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('导出所有用户失败:', error);
      ElMessage.error('导出失败，请重试！');
    }
  }
};

// 选择字段导出用户
const handleExportUsersWithSelection = async () => {
  exportDialogVisible.value = true;
  await fetchExportFields(); // 打开弹窗时获取可选字段
};

// 确认选择字段导出
const confirmExport = async () => {
  if (selectedExportFields.value.length === 0) {
    ElMessage.warning('请至少选择一个导出字段！');
    return;
  }
  try {
    const exportRequest: UserExportRequest = {
      fields: selectedExportFields.value,
      fileName: exportFileName.value || '用户数据',
      status: exportStatusFilter.value ?? undefined // 使用 ?? 操作符处理 null/undefined
    };
    await userService.exportUsers(exportRequest); // 调用后端接口，触发下载
    ElMessage.success('用户数据已开始导出！');
    exportDialogVisible.value = false;
  } catch (error: any) {
    console.error('选择字段导出失败:', error);
    ElMessage.error('导出失败，请重试！');
  }
};


// 组件挂载时获取用户列表
onMounted(() => {
  if (isAdmin.value) { // 只有管理员才去获取用户列表
    fetchUserList();
  } else {
    ElMessage.warning('您没有权限访问用户管理模块。');
    router.push('/'); // 非管理员跳转回主页
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