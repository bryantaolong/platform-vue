<template>
  <div class="p-6">
    <div v-if="loading">加载中...</div>
    <div v-else-if="users.length === 0">
      <p>您暂时还没有粉丝</p>
    </div>
    <div v-else>
      <UserListItem
          v-for="user in users"
          :key="user.id"
          :user="user"
      />
      <el-pagination
          class="mt-4 text-center"
          background
          layout="prev, pager, next"
          :page-size="pageSize"
          :current-page="pageNum"
          :total="total"
          @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getFollowerUsers } from '@/api/userFollow'
import type { User } from '@/models/entity/User'
import UserListItem from '@/components/user/UserListItem.vue'

const route = useRoute()
const userId = ref<number>(Number(route.params.id))

const users = ref<User[]>([])
const pageNum = ref(1)
const pageSize = 10
const total = ref(0)
const loading = ref(true)

const loadData = async (page = 1) => {
  if (!userId.value) return
  try {
    loading.value = true
    pageNum.value = page

    const res = await getFollowerUsers(userId.value, page, pageSize)

    if (res.code === 200 || res.code === 0) {
      users.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('加载粉丝列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  loadData(page)
}

onMounted(() => loadData())

watch(() => route.params.id, (newId) => {
  userId.value = Number(newId)
  pageNum.value = 1
  loadData()
})
</script>
