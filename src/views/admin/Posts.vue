<template>
  <div class="post-management-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>博文管理</span>
        </div>
      </template>

      <PostSearchForm
          :search-form="searchForm"
          @search="handleSearch"
          @reset="handleReset"
      />

      <PostTable
          :posts="postList"
          :loading="loading"
          @edit="openEditDialog"
          @delete="handleDeletePost"
      />

      <el-pagination
          class="pagination"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />

      <EditPostDialog
          v-if="editPost"
          v-model:visible="showEditDialog"
          :post="editPost"
          @saved="fetchPosts"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
// 1. 从 element-plus 导入 ElMessageBox 和 ElMessage
import { ElMessage, ElMessageBox } from 'element-plus';
import { getAllPosts, deletePost } from '@/api/post'; // 假设你已经更新了 api/post.ts
import type { Post } from '@/models/entity/Post';
import PostSearchForm from '@/components/post/admin/PostSearchForm.vue';
import PostTable from '@/components/post/admin/PostTable.vue';
import EditPostDialog from '@/components/post/admin/EditPostDialog.vue';

const postList = ref<Post[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const showEditDialog = ref(false);
const editPost = ref<Post | null>(null);

const searchForm = reactive({
  title: '',
  authorId: null,
  status: ''
});

/**
 * 获取博文分页数据
 */
const fetchPosts = async () => {
  loading.value = true;
  try {
    // 注意: 这里应该使用为管理员设计的 getAllPosts 函数
    const res = await getAllPosts({
      page: currentPage.value - 1, // 后端页码从 0 开始
      size: pageSize.value,
      // 注意: 后端接口似乎不支持按 title, authorId, status 搜索，
      // 如果需要此功能，后端也需要同步修改。此处暂时保持原样。
      ...searchForm
    });

    if (res.code === 200 && res.data) {
      postList.value = res.data.content || [];
      total.value = res.data.totalElements || 0;
    } else {
      ElMessage.warning('获取博文数据失败');
    }
  } catch (e) {
    ElMessage.error('加载博文失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 搜索提交
 */
const handleSearch = () => {
  currentPage.value = 1;
  fetchPosts();
};

/**
 * 重置搜索
 */
const handleReset = () => {
  Object.assign(searchForm, { title: '', authorId: null, status: '' });
  currentPage.value = 1;
  fetchPosts();
};

/**
 * 分页大小变化
 */
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchPosts();
};

/**
 * 页码变化
 */
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchPosts();
};

/**
 * 打开编辑弹窗
 */
const openEditDialog = (post: Post) => {
  editPost.value = { ...post };
  showEditDialog.value = true;
};

/**
 * 删除文章
 * 2. 修改 handleDeletePost 函数
 */
const handleDeletePost = async (post: Post) => {
  try {
    // 在删除前弹出确认框
    await ElMessageBox.confirm(
        `确定要删除博文《${post.title}》吗？此操作不可撤销。`, // 提示信息，使用模板字符串更友好
        '确认删除', // 弹窗标题
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning', // 警告类型图标
        }
    );

    // 如果用户点击了“确定”，则会继续执行下面的代码
    await deletePost(post.id!);
    ElMessage.success('删除成功');
    await fetchPosts(); // 重新加载列表

  } catch (error) {
    // 如果用户点击了“取消”，或者关闭了弹窗，`ElMessageBox.confirm` 会抛出一个异常
    // 我们可以捕获这个异常来处理取消操作
    if (error === 'cancel') {
      ElMessage.info('已取消删除');
    } else {
      // 如果是其他错误（例如 API 调用失败），则显示通用错误信息
      ElMessage.error('删除失败');
    }
  }
};

onMounted(fetchPosts);
</script>
<style scoped>
.card-header {
  font-size: 18px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
}
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
