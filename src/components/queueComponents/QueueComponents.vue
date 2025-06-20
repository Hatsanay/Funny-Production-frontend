<template>
  <div>
    <ul class="nav nav-tabs">
      <li class="nav-item">
        <a
          class="nav-link tab-item"
          :class="{ active: activeTab === '1' }"
          @click.prevent="setActiveTab('1')"
          href="#"
        >
          <i class="fa-solid fa-clipboard-list"></i>
          คิวงาน Graphic
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === '2' }"
          @click.prevent="setActiveTab('2')"
          href="#"
        >
          <i class="fa-solid fa-desktop"></i>
          คิวงาน UI
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === '3' }"
          @click.prevent="setActiveTab('3')"
          href="#"
        >
          <i class="fa-solid fa-clapperboard"></i>
          คิวงาน Animation
        </a>
      </li>
    </ul>

    <div class="tab-content mt-3">
      <div
        v-if="activeTab === '1'"
        class="tab-pane fade"
        :class="{ 'show active': activeTab === '1' }"
      >
        <CRow style="margin-bottom: 10px">
          <CCol :md="6"></CCol>
          <CCol :md="1">
            <CButton
            style="margin-bottom: 10px"
              class="btn btn-danger text-light"
              block
              @click="showModalHistoryGraphic()"
            >
            <i class="fa-regular fa-clock">ประวัติ</i>
            
            </CButton>
          </CCol>
          <CCol :md="3" style="margin-bottom: 10px">
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
          <CCol :md="2">
            <CButton
              color="primary"
              class="w-100 modern-button"
              block
              style="margin-bottom: 10px"
              @click="showModalCreateGraphic()"
            >
              <i class="fa-solid fa-plus"></i>
              สร้างคิว
            </CButton>
          </CCol>
        </CRow>

        <div class="row">
          <div class="col-md-12">
            <div class="card mb-4">
              <div class="card-header">ตารางคิวงาน Graphic</div>
              <div class="card-body table-responsive p-0">
                <table class="table">
                  <thead>
                    <tr>
                      <th>ลำดับคิว</th>
                      <th>รายละเอียดงาน</th>
                      <th>ID Discord</th>
                      <th>ชื่อ Discord</th>
                      <th>สถานะ</th>
                      <th>ระยะเวลา (วัน)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(queue, index) in license" :key="index">
                      <td>
                        <span v-if="queue.period === 0" class="text-danger">
                          <i class="fa-solid fa-triangle-exclamation"></i>
                          {{ getQueueNumber(index) }}
                        </span>
                        <span v-else-if="queue.period === 1" class="text-warning">
                          <i class="fa-solid fa-triangle-exclamation"></i>
                          {{ getQueueNumber(index) }}
                        </span>
                        <span v-else>
                          &nbsp;&nbsp;&nbsp;{{ getQueueNumber(index) }}
                        </span>
                      </td>
                      <td>{{ queue.per_name || "N/A" }}</td>
                      <td>{{ queue.client_id || "N/A" }}</td>
                      <td>{{ queue.discordName || "N/A" }}</td>
                      <td v-if="queue.progress_status === 'waiting'">รอคิว</td>
                      <td v-if="queue.progress_status === 'in_progress'">
                        กำลังดำเนินงาน
                      </td>
                      <td v-if="queue.progress_status === 'completed'">เสร็จสิ้น</td>
                      <td>ประมาณ {{ queue.period || 0 }} วัน</td>
                      <td>
                        <CButton
                          color="warning"
                          size="sm"
                          @click="showModalEditGraphic(queue._id)"
                        >
                          <i class="fa-solid fa-pen-to-square"></i> แก้ไขคิว
                        </CButton>
                      </td>
                      <td>
                        <CButton
                          color="success"
                          size="sm"
                          class="text-white"
                          @click="showModalDeleteGraphic(queue._id)"
                        >
                          <i class="fa-solid fa-circle-check"></i> เสร็จสิ้น
                        </CButton>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="card-footer">
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

      <div
        v-if="activeTab === '2'"
        class="tab-pane fade"
        :class="{ 'show active': activeTab === '2' }"
      >
        <CRow style="margin-bottom: 10px">
          <CCol :md="7"></CCol>
          <CCol :md="3" style="margin-bottom: 10px">
            <CInputGroup>
              <CFormInput
                placeholder="ค้นหา..."
                v-model="searchQueryUI"
                @input="fetchQueueUI"
              />
              <CInputGroupText>
                <CIcon name="cil-magnifying-glass" />
              </CInputGroupText>
            </CInputGroup>
          </CCol>
          <CCol :md="2">
            <CButton
              color="primary"
              class="w-100 modern-button"
              block
              style="margin-bottom: 10px"
              @click=""
            >
              <i class="fa-solid fa-plus"></i>
              สร้างคิวงาน
            </CButton>
          </CCol>
        </CRow>

        <div class="row">
          <div class="col-md-12">
            <div class="card mb-4">
              <div class="card-header">ตารางคิวงาน UI</div>
              <div class="card-body table-responsive p-0">
                <table class="table">
                  <thead>
                    <tr></tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
              <div class="card-footer">
                <div class="row">
                  <div class="col-md-4">
                    <div class="d-flex align-items-center">
                      <span>Show</span>
                      <select
                        v-model="rowsPerPage"
                        class="form-select mx-2"
                        style="width: auto"
                        @change="fetchQueueUI"
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

      <div
        v-if="activeTab === '3'"
        class="tab-pane fade"
        :class="{ 'show active': activeTab === '3' }"
      >
        <div class="card mb-4">
          <div class="card-header">คิวงาน Animation</div>
          <div class="card-body">
            <p>เนื้อหาคิวงาน Animation จะแสดงที่นี่</p>
          </div>
        </div>
      </div>
    </div>

    <CModal
      alignment="center"
      :visible="visibleCreateGraphicModal"
      @close="closeCreateGraphicModal"
      aria-labelledby="VerticallyCenteredExample"
      size="lg"
    >
      <CModalHeader>
        <CModalTitle id="VerticallyCenteredExample">สร้างคิวงาน Graphic</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CreateQueueGraphicComponents
          :userId="userId.value"
          @closeModal="closeCreateGraphicModal"
          @queueCreated="fetchQueue"
        />
      </CModalBody>
    </CModal>

    <CModal
      alignment="center"
      :visible="visibleEditGraphicModal"
      @close="closeEditGraphicModal"
      aria-labelledby="VerticallyCenteredExampleEdit"
      size="lg"
    >
      <CModalHeader>
        <CModalTitle id="VerticallyCenteredExampleEdit">แก้ไขคิวงาน Graphic</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <EditQueueGraphicComponents
          :userId="userId.value"
          :queueId="selectedQueueId"
          @closeModal="closeEditGraphicModal"
          @queueUpdated="fetchQueue"
        />
      </CModalBody>
    </CModal>

    <CModal
      alignment="center"
      :visible="visibleDeleteGraphicModal"
      @close="closeDeleteGraphicModal"
      aria-labelledby="VerticallyCenteredExampleDelete"
      size="lg"
    >
      <CModalHeader>
        <CModalTitle id="VerticallyCenteredExampleDelete">ปิดคิวงาน Graphic</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <DeleteQueueGraphicComponents
          :userId="userId.value"
          :queueId="selectedQueueId"
          @closeModal="closeDeleteGraphicModal"
          @queueUpdated="fetchQueue"
        />
      </CModalBody>
    </CModal>

    <CModal
      alignment="center"
      :visible="visibleHistoryGraphicModal"
      @close="closeHistoryGraphicModal"
      aria-labelledby="VerticallyCenteredExampleHistory"
      size="lg"
    >
      <CModalHeader>
        <CModalTitle id="VerticallyCenteredExampleHistory">ประวัติคิว Graphic</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <HistoryQueueGraphicComponents
          @closeModal="closeHistoryGraphicModal"
        />
      </CModalBody>
    </CModal>
  </div>
</template>

<script>
import axios from "axios";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import CreateQueueGraphicComponents from "./CreateQueueGraphicComponents.vue";
import DeleteQueueGraphicComponents from "./DeleteQueueGraphicComponents.vue";
import EditQueueGraphicComponents from "./EditQueueGraphicComponents.vue";
import HistoryQueueGraphicComponents from "./HistoryQueueGraphicComponents.vue";

export default {
  name: "QueueComponents",
  components: {
    CreateQueueGraphicComponents,
    EditQueueGraphicComponents,
    DeleteQueueGraphicComponents,
    HistoryQueueGraphicComponents,
  },
  setup() {
    const activeTab = ref("1");
    const searchQuery = ref("");
    const searchQueryUI = ref("");
    const rowsPerPage = ref(10);
    const currentPage = ref(1);
    const license = ref([]);
    const total = ref(0);
    const totalPages = computed(() => Math.ceil(total.value / rowsPerPage.value));
    const visibleCreateGraphicModal = ref(false);
    const visibleEditGraphicModal = ref(false);
    const visibleDeleteGraphicModal = ref(false);
    const visibleHistoryGraphicModal = ref(false);
    const selectedQueueId = ref(null);
    const route = useRoute();
    const userId = ref(localStorage.getItem("userID"));
    const token = ref(localStorage.getItem("token"));

    const setActiveTab = (tab) => {
      activeTab.value = tab;
      if (tab === "1") {
        fetchQueue();
      }
      if (tab === "2") {
        fetchQueueUI();
      }
      if (tab === "3") {
      }
    };

    const showModalCreateGraphic = () => {
      visibleCreateGraphicModal.value = true;
    };

    const closeCreateGraphicModal = () => {
      visibleCreateGraphicModal.value = false;
    };

    const showModalEditGraphic = (queueId) => {
      selectedQueueId.value = queueId;
      visibleEditGraphicModal.value = true;
    };

    const closeEditGraphicModal = () => {
      selectedQueueId.value = null;
      visibleEditGraphicModal.value = false;
    };

    const showModalDeleteGraphic = (queueId) => {
      selectedQueueId.value = queueId;
      visibleDeleteGraphicModal.value = true;
    };

    const closeDeleteGraphicModal = () => {
      selectedQueueId.value = null;
      visibleDeleteGraphicModal.value = false;
    };


    
    const showModalHistoryGraphic = () => {
      visibleHistoryGraphicModal.value = true;
    };

    const closeHistoryGraphicModal = () => {
      visibleHistoryGraphicModal.value = false;
    };



    const truncateKeyName = (keyName) => {
      if (!keyName) return "";
      return keyName.length > 10 ? keyName.substring(0, 10) + "..." : keyName;
    };

    const getQueueNumber = (index) => {
      return (currentPage.value - 1) * rowsPerPage.value + index + 1;
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return "N/A";
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
    };

    const fetchQueue = async () => {
      const offset = (currentPage.value - 1) * rowsPerPage.value;
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/auth/getAllQueueGraphic", {
          params: {
            limit: rowsPerPage.value,
            offset: offset,
            search: searchQuery.value,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          license.value = response.data.data || [];
          total.value = response.data.total || 0;
        } else {
          license.value = [];
          total.value = 0;
        }
      } catch (error) {
        console.error("Error fetching queue:", error);
        license.value = [];
        total.value = 0;
      }
    };

    const fetchQueueUI = async () => {
      const offset = (currentPage.value - 1) * rowsPerPage.value;
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/auth/getAllQueueGraphic", {
          params: {
            limit: rowsPerPage.value,
            offset: offset,
            search: searchQueryUI.value,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          license.value = response.data.data || [];
          total.value = response.data.total || 0;
        } else {
          license.value = [];
          total.value = 0;
        }
      } catch (error) {
        console.error("Error fetching queue UI:", error);
        license.value = [];
        total.value = 0;
      }
    };

    const setPage = (page) => {
      currentPage.value = page;
      if (activeTab.value === "1") fetchQueue();
      if (activeTab.value === "2") fetchQueueUI();
    };

    onMounted(() => {
      fetchQueue();
    });

    watch([searchQuery, rowsPerPage], fetchQueue);
    watch([searchQueryUI, rowsPerPage], fetchQueueUI);

    return {
      activeTab,
      searchQuery,
      searchQueryUI,
      rowsPerPage,
      currentPage,
      license,
      totalPages,
      setActiveTab,
      setPage,
      fetchQueue,
      fetchQueueUI,
      truncateKeyName,
      userId,
      token,
      visibleCreateGraphicModal,
      visibleEditGraphicModal,
      visibleDeleteGraphicModal,
      visibleHistoryGraphicModal,
      showModalCreateGraphic,
      closeCreateGraphicModal,
      showModalEditGraphic,
      closeEditGraphicModal,
      showModalDeleteGraphic,
      closeDeleteGraphicModal,
      showModalHistoryGraphic,
      closeHistoryGraphicModal,
      getQueueNumber,
      formatDate,
      selectedQueueId,
    };
  },
};
</script>

<style scoped>
.modern-button {
  background-color: #ffaa00;
  --cui-btn-border-color: #ffaa00;
}

.modern-button:hover {
  background-color: #d38d00;
  --cui-btn-border-color: #d38d00;
}

.card-header {
  background-color: #ffaa00;
  color: white;
}

.fontwhite {
  color: white;
}

.text-danger i {
  margin-right: 5px;
}

.text-warning i {
  margin-right: 5px;
}
</style>
