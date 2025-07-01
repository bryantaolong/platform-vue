<template>
  <div class="overview-container">
    <el-card class="overview-card">
      <template #header>
        <div class="card-header">
          <span>仪表盘概览</span>
          <el-button type="primary" link @click="goToHome">返回主页</el-button>
        </div>
      </template>

      <el-row :gutter="20" class="summary-cards">
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="用户总数" :value="12345" />
            <div class="statistic-footer">
              <div class="footer-item">
                <span>较昨日</span>
                <span class="green">
                  2%
                  <el-icon><CaretTop /></el-icon>
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="今日活跃" :value="888" />
            <div class="statistic-footer">
              <div class="footer-item">
                <span>较昨日</span>
                <span class="red">
                  3%
                  <el-icon><CaretBottom /></el-icon>
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="订单总数" :value="5678" />
            <div class="statistic-footer">
              <div class="footer-item">
                <span>较昨日</span>
                <span class="green">
                  5%
                  <el-icon><CaretTop /></el-icon>
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <el-statistic title="访问量" :value="99999" />
            <div class="statistic-footer">
              <div class="footer-item">
                <span>较昨日</span>
                <span class="red">
                  1%
                  <el-icon><CaretBottom /></el-icon>
                </span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-divider>近期活动</el-divider>

      <el-table :data="recentActivities" style="width: 100%" class="recent-activities-table">
        <el-table-column prop="time" label="时间" width="180"></el-table-column>
        <el-table-column prop="user" label="用户"></el-table-column>
        <el-table-column prop="action" label="操作"></el-table-column>
      </el-table>

      <el-divider>数据概览 (Placeholder for Chart)</el-divider>

      <el-card shadow="always">
        <div class="chart-placeholder">
          <p>这里将是图表区域，例如折线图、柱状图等。</p>
          <p>（需要引入 Echarts、Chart.js 等图表库来渲染）</p>
          <img src="https://via.placeholder.com/400x200?text=Chart+Placeholder" alt="Chart Placeholder" style="max-width: 100%; height: auto;">
        </div>
      </el-card>

    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { CaretTop, CaretBottom } from '@element-plus/icons-vue';

const router = useRouter();

const recentActivities = ref([
  { time: '2025-07-01 10:30', user: 'admin', action: '登录系统' },
  { time: '2025-07-01 10:25', user: 'user01', action: '创建新文章' },
  { time: '2025-07-01 10:20', user: 'user02', action: '更新个人资料' },
  { time: '2025-07-01 10:15', user: 'admin', action: '审核通过文章' },
]);

const goToHome = () => {
  router.push('/');
};
</script>

<style scoped>
/* 样式与原Dashboard.vue基本相同，但根容器名更改 */
.overview-container {
  display: flex;
  justify-content: center;
  /* min-height: calc(100vh - 60px); 这在子组件中不再需要精确计算 */
  padding: 0px; /* 父级el-main已经有padding */
  background-color: #fff; /* 主内容区背景色 */
}

.overview-card {
  width: 100%; /* 填充父容器 */
  /* max-width: 1200px; */ /* 如果需要可在父级控制最大宽度 */
  /* margin-top: 30px; */ /* 父级el-main已经有padding */
  box-shadow: none; /* 移除内层卡片的阴影，或者使用 lighter shadow */
  border: none; /* 移除内层卡片的边框 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
}

.summary-cards .el-card {
  text-align: center;
}

.statistic-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 8px;
}

.statistic-footer .footer-item {
  display: flex;
  justify-content: center;
  align-items: center;
}

.statistic-footer .green {
  color: var(--el-color-success);
}

.statistic-footer .red {
  color: var(--el-color-danger);
}

.statistic-footer .el-icon {
  margin-left: 4px;
}

.recent-activities-table {
  margin-top: 20px;
}

.chart-placeholder {
  text-align: center;
  padding: 30px;
  color: #909399;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  margin-top: 20px;
}
.chart-placeholder img {
    margin-top: 15px;
    border: 1px solid #eee;
}
</style>