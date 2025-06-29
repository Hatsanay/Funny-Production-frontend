<template>
  <div>
    <CRow style="margin-bottom: 10px">
      <CCol :md="7"></CCol>
      <CCol :md="5" style="margin-bottom: 10px; padding-left: 5px;">
        <CInputGroup>
          <CFormInput
            placeholder="ค้นหา..."
            v-model="searchQuery"
            @input="fetchQueue"
          />
          <CInputGroupText>
            <CIcon name="cil-magnifying-glass" />
          </CInputGroupText>
        </CInputGroup>
      </CCol>
    </CRow>

    <div class="row">
      <div class="col-md-12">
        <div class="card mb-4">
          <div class="card-header">ตารางประวัติคิวงาน Animation</div>
          <div class="card-body table-responsive p-0">
            <table v-if="license.length" class="table">
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>วันที่สร้าง</th>
                  <th>รายละเอียดงาน</th>
                  <th>ID Discord</th>
                  <th>ชื่อ Discord</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(queue, index) in license" :key="index">
                  <td>
                    <span
                      v-if="queue.period === 0"
                      class="text-danger"
                      style="display: inline-flex; align-items: center;"
                    >
                      {{ getQueueNumber(index) }}
                    </span>
                    <span
                      v-else-if="queue.period === 1"
                      class="text-warning"
                      style="display: inline-flex; align-items: center;"
                    >
                      {{ getQueueNumber(index) }}
                    </span>
                    <span v-else style="padding-left: 20px;">
                      {{ getQueueNumber(index) }}
                    </span>
                  </td>
                  <td>
                    {{ formatDate(queue.createdAt) }}
                  </td>
                  <td>{{ queue.per_name || "N/A" }}</td>
                  <td>{{ queue.client_id || "N/A" }}</td>
                  <td>{{ queue.discordName || "N/A" }}</td>
                  <td>{{ statusMap[queue.progress_status] || "N/A" }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="text-center p-3">
              {{ errorMessage || "ไม่มีข้อมูลคิวงานในขณะนี้" }}
            </div>
          </div>
          <div v-if="license.length" class="card-footer">
            <div class="row">
              <div class="col-md-4">
                <div class="d-flex align-items-center">
                  <span>Show</span>
                  <select
                    v-model="rowsPerPage"
                    class="form-select mx-2"
                    style="width: auto"
                    @change="fetchQueue"
                  >
                    <option :value="5">5</option>
                    <option :value="10">10</option>
                    <option :value="20">20</option>
                    <option :value="50">50</option>
                    <option :value="100">100</option>
                  </select>
                  <span>entries</span>
                </div>
              </div>
              <div class="col-md-8 d-flex justify-content-end">
                <CButton
                  color="secondary"
                  :disabled="currentPage === 1"
                  @click="currentPage--"
                >
                  Previous
                </CButton>
                <CButton
                  v-for="page in totalPages"
                  :key="page"
                  @click="setPage(page)"
                  :color="page === currentPage ? 'primary' : 'secondary'"
                  class="mx-1"
                >
                  {{ page }}
                </CButton>
                <CButton
                  color="secondary"
                  :disabled="currentPage === totalPages"
                  @click="currentPage++"
                >
                  Next
                </CButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { computed, onMounted, ref, watch } from "vue";

export default {
  name: "HistoryQueueAnimationComponents",
  setup() {
    const searchQuery = ref("");
    const rowsPerPage = ref(10);
    const currentPage = ref(1);
    const license = ref([]);
    const total = ref(0);
    const errorMessage = ref("");
    const totalPages = computed(() => Math.ceil(total.value / rowsPerPage.value));
    const userId = ref(localStorage.getItem("userID"));
    const token = ref(localStorage.getItem("token"));

    const statusMap = {
      waiting: "รอคิว",
      in_progress: "กำลังดำเนินงาน",
      completed: "เสร็จสิ้น",
      cancel: "ยกเลิก",
    };

    const getQueueNumber = (index) => {
      return (currentPage.value - 1) * rowsPerPage.value + index + 1;
    };

    const fetchQueue = async () => {
      const offset = (currentPage.value - 1) * rowsPerPage.value;
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("กรุณาเข้าสู่ระบบ");
        }
        const response = await axios.get("/api/auth/HistoryQueueAnimation", {
          params: {
            limit: rowsPerPage.value,
            offset: offset,
            search: searchQuery.value,
            status: "completed",
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          license.value = response.data.data || [];
          total.value = response.data.total || 0;
          errorMessage.value = "";
        } else {
          license.value = [];
          total.value = 0;
          errorMessage.value = response.data.error || "ไม่พบข้อมูลคิวงาน";
        }
      } catch (error) {
        console.error("Error fetching queue:", error);
        license.value = [];
        total.value = 0;
        errorMessage.value = error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล";
      }
    };

    const setPage = (page) => {
      currentPage.value = page;
      fetchQueue();
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return "N/A";
      const date = new Date(dateStr);
      return isNaN(date.getTime())
        ? "N/A"
        : date
            .toLocaleString("th-TH", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
            .replace(/\//g, "/");
    };
    onMounted(() => {
      fetchQueue();
    });

    watch([searchQuery, rowsPerPage], fetchQueue);

    return {
      searchQuery,
      rowsPerPage,
      currentPage,
      license,
      totalPages,
      setPage,
      fetchQueue,
      userId,
      token,
      getQueueNumber,
      errorMessage,
      statusMap,
      formatDate,
    };
  },
};
</script>

<style scoped>
.card-header {
  background-color: #ffaa00;
  color: white;
}

.text-danger i,
.text-warning i {
  margin-right: 5px;
}
</style>