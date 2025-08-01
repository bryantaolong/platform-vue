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

    <el-form-item label="状态">
      <el-select v-model="localSearchForm.status" placeholder="选择状态" clearable>
        <el-option label="正常" :value="0"></el-option>
        <el-option label="封禁" :value="1"></el-option>
        <el-option label="锁定" :value="2"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="角色">
      <el-input v-model="localSearchForm.roles" placeholder="输入角色标识" clearable></el-input>
    </el-form-item>

    <el-form-item label="登录IP">
      <el-input v-model="localSearchForm.loginIp" placeholder="输入登录IP" clearable></el-input>
    </el-form-item>

    <el-form-item label="登录失败次数">
      <el-input-number
          v-model="localSearchForm.loginFailCount"
          :min="0"
          :max="10"
          placeholder="登录失败次数"
          controls-position="right"
      />
    </el-form-item>

    <el-form-item label="删除状态">
      <el-select v-model="localSearchForm.deleted" placeholder="选择删除状态" clearable>
        <el-option label="未删除" :value="0"></el-option>
        <el-option label="已删除" :value="1"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="登录时间">
      <el-date-picker
          v-model="localSearchForm.loginTime"
          type="datetime"
          placeholder="选择登录时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          clearable
      />
    </el-form-item>

    <el-form-item label="密码重置时间">
      <el-date-picker
          v-model="localSearchForm.passwordResetTime"
          type="datetime"
          placeholder="选择密码重置时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          clearable
      />
    </el-form-item>

    <el-form-item label="账户锁定时间">
      <el-date-picker
          v-model="localSearchForm.accountLockTime"
          type="datetime"
          placeholder="选择锁定时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          clearable
      />
    </el-form-item>

    <el-form-item label="创建时间范围">
      <el-date-picker
          v-model="localSearchForm.createTimeStart"
          type="date"
          placeholder="开始日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          clearable
      />
      <span style="margin: 0 5px">至</span>
      <el-date-picker
          v-model="localSearchForm.createTimeEnd"
          type="date"
          placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          clearable
      />
    </el-form-item>

    <el-form-item label="更新时间范围">
      <el-date-picker
          v-model="localSearchForm.updateTimeStart"
          type="date"
          placeholder="开始日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          clearable
      />
      <span style="margin: 0 5px">至</span>
      <el-date-picker
          v-model="localSearchForm.updateTimeEnd"
          type="date"
          placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          clearable
      />
    </el-form-item>

    <el-form-item label="创建人">
      <el-input v-model="localSearchForm.createBy" placeholder="输入创建人" clearable></el-input>
    </el-form-item>

    <el-form-item label="更新人">
      <el-input v-model="localSearchForm.updateBy" placeholder="输入更新人" clearable></el-input>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="onSearchClick">查询</el-button>
      <el-button @click="onResetClick">重置</el-button>
      <el-button @click="toggleAdvancedSearch" link>
        {{ showAdvanced ? '收起' : '高级搜索' }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
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

const showAdvanced = ref(false);

// 复制传入的 searchRequest 到局部 reactive 对象
const localSearchForm = reactive<UserSearchRequest>({
  username: '',
  phoneNumber: '',
  email: '',
  status: undefined,
  roles: undefined,
  loginTime: undefined,
  loginIp: undefined,
  passwordResetTime: undefined,
  loginFailCount: undefined,
  accountLockTime: undefined,
  deleted: undefined,
  version: undefined,
  createTime: undefined,
  createTimeStart: undefined,
  createTimeEnd: undefined,
  updateTime: undefined,
  updateTimeStart: undefined,
  updateTimeEnd: undefined,
  createBy: undefined,
  updateBy: undefined,
  ...props.modelValue,
});

// 监听父组件传入 modelValue 变化
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

// 切换高级搜索
const toggleAdvancedSearch = () => {
  showAdvanced.value = !showAdvanced.value;
};
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.el-form-item {
  margin-right: 15px;
  margin-bottom: 10px;
}

.el-date-editor {
  width: 180px;
}

.el-input-number {
  width: 180px;
}
</style>