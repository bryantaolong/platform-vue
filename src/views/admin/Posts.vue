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
          @export="handleExportPost" />

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
import { ElMessage, ElMessageBox } from 'element-plus';
import { getAllPosts, deletePost } from '@/api/post';
import type { Post } from '@/models/entity/Post';
import PostSearchForm from '@/components/post/admin/PostSearchForm.vue';
import PostTable from '@/components/post/admin/PostTable.vue';
import EditPostDialog from '@/components/post/admin/EditPostDialog.vue';
// 导入你的导出工具类
import { exportAsText, exportAsDocx, exportAsPdf } from '@/utils/exportUtil';


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
    const res = await getAllPosts({
      page: currentPage.value - 1,
      size: pageSize.value,
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
 */
const handleDeletePost = async (post: Post) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除博文《${post.title}》吗？此操作不可撤销。`,
        '确认删除',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
    );

    await deletePost(post.id!);
    ElMessage.success('删除成功');
    await fetchPosts();

  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消删除');
    } else {
      ElMessage.error('删除失败');
    }
  }
};

/**
 * 处理导出文章
 * @param post - 要导出的博文对象
 * @param format - 导出格式 ('md', 'docx', 'pdf', 'txt')
 */
const handleExportPost = async (post: Post, format: 'md' | 'docx' | 'pdf' | 'txt') => {
  try {
    switch (format) {
      case 'md':
        exportAsText(post, 'md');
        break;
      case 'txt': // 新增 TXT 导出逻辑
        exportAsText(post, 'txt');
        break;
      case 'docx':
        await exportAsDocx(post);
        break;
      case 'pdf':
        exportAsPdf(post);
        break;
      default:
        ElMessage.warning('不支持的导出格式');
        return;
    }
    ElMessage.success(`博文《${post.title}》已导出为 ${format.toUpperCase()} 格式`);
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败，请稍后再试');
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