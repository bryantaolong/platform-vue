<template>
  <el-form :inline="true" :model="localSearchForm" class="search-form" @submit.prevent>
    <el-form-item label="用户名">
      <el-input v-model="localSearchForm.username" placeholder="输入用户名" clearable></el-input>
    </el-form-item>
    <el-form-item label="邮箱">
      <el-input v-model="localSearchForm.email" placeholder="输入邮箱" clearable></el-input>
    </el-form-item>
    <el-form-item label="手机号">
      <el-input v-model="localSearchForm.phoneNumber" placeholder="输入手机号" clearable></el-input>
    </el-form-item>
    <el-form-item label="性别">
      <el-select v-model="localSearchForm.gender" placeholder="选择性别" clearable>
        <el-option label="男" :value="1"></el-option>
        <el-option label="女" :value="0"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="状态">
      <el-select v-model="localSearchForm.status" placeholder="选择状态" clearable>
        <el-option label="正常" :value="0"></el-option>
        <el-option label="封禁" :value="1"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="创建时间开始">
      <el-date-picker
          v-model="localSearchForm.createTimeStart"
          type="date"
          placeholder="选择开始日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          clearable
      />
    </el-form-item>

    <el-form-item label="创建时间结束">
      <el-date-picker
          v-model="localSearchForm.createTimeEnd"
          type="date"
          placeholder="选择结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          clearable
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="onSearchClick">查询</el-button>
      <el-button @click="onResetClick">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { UserSearchRequest } from '@/models/request/user/UserSearchRequest';

interface Props {
  modelValue: UserSearchRequest;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: UserSearchRequest): void;
  (e: 'search'): void;
  (e: 'reset'): void;
}>();

// 复制传入的 searchRequest 到局部 reactive 对象，避免双向引用问题
const localSearchForm = reactive<UserSearchRequest>({
  username: '',
  phoneNumber: '',
  email: '',
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
  ...props.modelValue,
});

// 监听父组件传入 modelValue 变化，更新本地表单数据
watch(
    () => props.modelValue,
    (newVal) => {
      Object.assign(localSearchForm, newVal);
    }
);

// 搜索按钮点击
const onSearchClick = () => {
  emit('update:modelValue', { ...localSearchForm });
  emit('search');
};

// 重置按钮点击
const onResetClick = () => {
  Object.keys(localSearchForm).forEach((key) => {
    // @ts-ignore
    localSearchForm[key] = undefined;
  });
  emit('update:modelValue', { ...localSearchForm });
  emit('reset');
};
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
}
</style>
