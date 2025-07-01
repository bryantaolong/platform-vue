<!-- src/components/profile/UserListDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-table :data="userList" v-loading="loading" style="width: 100%" border>
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="username" label="用户名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="goToUserProfile(scope.row.id)">查看主页</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalUsers"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      class="pagination-container"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router'; // 引入 useRouter
import * as userFollowService from '@/api/userFollow';
import type { User } from '@/models/entity/User';

// Define component props
const props = defineProps<{
  visible: boolean;
  userId: number | null; // The ID of the user whose following/followers we are listing
  listType: 'following' | 'followers'; // 'following' or 'followers'
  dialogTitle: string;
}>();

// Define component emits
const emit = defineEmits(['update:visible']);

const router = useRouter(); // 获取 router 实例
const dialogVisible = ref(props.visible);
const userList = ref<User[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalUsers = ref(0);

// Watch for changes in the 'visible' prop to control the dialog
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal && props.userId) {
    // When dialog opens, reset pagination and fetch data
    currentPage.value = 1;
    fetchUserList();
  }
});

// Fetch user list based on listType
const fetchUserList = async () => {
  if (!props.userId) {
    ElMessage.error('用户ID缺失，无法获取列表。');
    return;
  }
  loading.value = true;
  try {
    let res;
    const params = { pageNum: currentPage.value, pageSize: pageSize.value };

    if (props.listType === 'following') {
      res = await userFollowService.getFollowingUsers(props.userId, params.pageNum, params.pageSize);
    } else { // 'followers'
      res = await userFollowService.getFollowerUsers(props.userId, params.pageNum, params.pageSize);
    }

    if (res.code === 200 && res.data) {
      userList.value = res.data.records || [];
      totalUsers.value = res.data.total || 0;
    } else {
      ElMessage.error(res?.message || '获取用户列表失败！');
      userList.value = [];
      totalUsers.value = 0;
    }
  } catch (error: any) {
    console.error(`获取${props.listType === 'following' ? '关注' : '粉丝'}列表失败:`, error);
    ElMessage.error('网络错误，无法获取用户列表！');
  } finally {
    loading.value = false;
  }
};

// Handle page size change
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchUserList();
};

// Handle current page change
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchUserList();
};

// Handle dialog close
const handleClose = () => {
  emit('update:visible', false);
};

// Navigate to user profile page
const goToUserProfile = (userId: number) => {
  // Navigate to the new UserProfile page
  router.push(`/user/${userId}`);
  handleClose(); // Close the current dialog
};

onMounted(() => {
  // Initial fetch if dialog is somehow visible on mount (less common)
  if (props.visible && props.userId) {
    fetchUserList();
  }
});
</script>

<style scoped>
.pagination-container {
  margin-top: 20px;
  justify-content: flex-end;
  display: flex;
}
</style>
