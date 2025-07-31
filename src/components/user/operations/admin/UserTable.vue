<template>
  <div class="table-wrapper">
    <el-table :data="userList" v-loading="loading" style="min-width: 1200px" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="phoneNumber" label="电话" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column label="性别" width="80">
        <template #default="scope">
          {{ formatGender(scope.row.gender) }}
        </template>
      </el-table-column>
      <el-table-column label="头像" width="80">
        <template #default="scope">
          <el-avatar :src="scope.row.avatar" size="small" />
        </template>
      </el-table-column>
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
      <el-table-column prop="loginTime" label="上次登录时间" width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.loginTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="loginIp" label="上次登录IP" width="140" />
      <el-table-column prop="passwordResetTime" label="密码重置时间" width="180">
        <template #default="scope">
          {{ formatDateTime(scope.row.passwordResetTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="deleted" label="逻辑删除" width="80">
        <template #default="scope">
          {{ scope.row.deleted === 1 ? '是' : '否' }}
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
          <el-button link type="primary" size="small" @click="$emit('edit', scope.row)">编辑</el-button>
          <el-button link type="warning" size="small" @click="$emit('change-role', scope.row)">改角色</el-button>
          <el-button link type="info" size="small" @click="$emit('change-password', scope.row)">改密码</el-button>
          <el-button link type="danger" size="small" @click="$emit('delete', scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/models/entity/User';
import { defineProps, defineEmits } from 'vue';
import { ElAvatar } from 'element-plus';

const props = defineProps<{
  userList: User[];
  loading: boolean;
}>();

const emits = defineEmits(['edit', 'change-role', 'change-password', 'delete']);

// 格式化日期时间
const formatDateTime = (dateTimeString: string) => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleString();
};

// 格式化性别
const formatGender = (gender: number) => {
  switch (gender) {
    case 0: return '未知';
    case 1: return '男';
    case 2: return '女';
    default: return '未知';
  }
};

// 获取角色显示名称
const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'ROLE_ADMIN': return '管理员';
    case 'ROLE_USER': return '普通用户';
    default: return role;
  }
};
</script>

<style scoped>
.table-wrapper {
  overflow-x: auto; /* 开启横向滚动 */
  width: 100%;
}
</style>