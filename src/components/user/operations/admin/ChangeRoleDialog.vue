<!-- src/components/user/ChangeRoleDialog.vue -->
<template>
  <el-dialog
      v-model="dialogVisible"
      title="更改用户角色"
      width="400px"
      :before-close="handleClose"
      destroy-on-close
  >
    <el-form ref="changeRoleFormRef" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="username" disabled />
      </el-form-item>

      <el-form-item label="角色" prop="roleIds">
        <el-select
            v-model="roleIds"
            multiple
            filterable
            placeholder="请选择角色"
            style="width: 100%"
        >
          <el-option
              v-for="role in allRoles"
              :key="role.id"
              :label="role.roleName"
              :value="role.id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { updateUserRole } from '@/api/user';
import {listAllRoles, type UserRoleOptionDTO} from '@/api/userRole';
import type { User } from '@/models/entity/User';

interface Props {
  visible: boolean;
  userData: User | null;      // 当前用户信息
  userRoleIds: number[];      // 当前用户已拥有的角色 id 列表
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'roleChanged'): void;
}>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

/* 表单数据 */
const username = ref('');
const roleIds = ref<number[]>([]);
const allRoles = ref<UserRoleOptionDTO[]>([]);
const submitting = ref(false);

/* 拉取全部角色 */
onMounted(async () => {
  try {
    const { data } = await listAllRoles();
    allRoles.value = data || [];
  } catch (e) {
    ElMessage.error('获取角色列表失败');
  }
});

/* 每次弹窗打开时初始化数据 */
watch(
    () => props.visible,
    (val) => {
      if (val && props.userData) {
        username.value = props.userData.username;
        roleIds.value = [...props.userRoleIds]; // 深拷贝，避免直接修改父组件数据
      }
    },
    { immediate: true }
);

function handleClose() {
  emit('update:visible', false);
}

async function submitForm() {
  if (!props.userData?.id) return;
  submitting.value = true;
  try {
    await updateUserRole(props.userData.id, roleIds.value);
    ElMessage.success('用户角色更新成功');
    emit('roleChanged');
    handleClose();
  } catch (e: any) {
    ElMessage.error(e?.message || '更新角色失败');
  } finally {
    submitting.value = false;
  }
}
</script>