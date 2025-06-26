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
                      <th></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(queue, index) in license" :key="queue._id">
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
                      <td>
                        <span v-if="queue.progress_status === 'waiting'">รอคิว</span>
                        <span v-else-if="queue.progress_status === 'in_progress'">กำลังดำเนินงาน</span>
                        <span v-else-if="queue.progress_status === 'completed'">เสร็จสิ้น</span>
                      </td>
                      <td>
                        <span v-if="queue.period === 0" class="text-danger">สิ้นสุดการส่งงาน (กรุณาเพิ่มระยะเวลา)</span>
                        <span v-else>ประมาณ {{ queue.period || 0 }} วัน</span>
                      </td>
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
          <CCol :md="6"></CCol>
          <CCol :md="1">
            <CButton
              style="margin-bottom: 10px"
              class="btn btn-danger text-light"
              block
              @click="showModalHistoryUI()"
            >
              <i class="fa-regular fa-clock">ประวัติ</i>
            </CButton>
          </CCol>
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
              @click="showModalCreateUI()"
            >
              <i class="fa-solid fa-plus"></i>
              สร้างคิว
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
                    <tr>
                      <th>ลำดับคิว</th>
                      <th>รายละเอียดงาน</th>
                      <th>ID Discord</th>
                      <th>ชื่อ Discord</th>
                      <th>สถานะ</th>
                      <th>ระยะเวลา (วัน)</th>
                      <th></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(queue, index) in queuesUI" :key="queue._id">
                      <td>
                        <span v-if="queue.period === 0" class="text-danger">
                          <i class="fa-solid fa-triangle-exclamation"></i>
                          {{ getQueueNumberUI(index) }}
                        </span>
                        <span v-else-if="queue.period === 1" class="text-warning">
                          <i class="fa-solid fa-triangle-exclamation"></i>
                          {{ getQueueNumberUI(index) }}
                        </span>
                        <span v-else>
                          &nbsp;&nbsp;&nbsp;{{ getQueueNumberUI(index) }}
                        </span>
                      </td>
                      <td>{{ queue.per_name || "N/A" }}</td>
                      <td>{{ queue.client_id || "N/A" }}</td>
                      <td>{{ queue.discordName || "N/A" }}</td>
                      <td>
                        <span v-if="queue.progress_status === 'waiting'">รอคิว</span>
                        <span v-else-if="queue.progress_status === 'in_progress'">กำลังดำเนิน</span>
                        <span v-else-if="queue.progress_status === 'completed'">เสร็จสิ้น</span>
                      </td>
                      <td>
                        <span v-if="queue.period === 0" class="text-danger">สิ้นสุดการส่งงาน (กรุณาเพิ่มระยะเวลา)</span>
                        <span v-else>ประมาณ {{ queue.period || 0 }} วัน</span>
                      </td>
                      <td>
                        <CButton
                          color="warning"
                          size="sm"
                          @click="showModalEditUI(queue._id)"
                        >
                          <i class="fa-solid fa-pen-to-square"></i> แก้ไขคิว
                        </CButton>
                      </td>
                      <td>
                        <CButton
                          color="success"
                          size="sm"
                          class="text-white"
                          @click="showModalDeleteUI(queue._id)"
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
                        v-model="rowsPerPageUI"
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
                      :disabled="currentPageUI === 1"
                      @click="currentPageUI--"
                    >
                      Previous
                    </CButton>
                    <CButton
                      v-for="page in totalPagesUI"
                      :key="page"
                      @click="setPageUI(page)"
                      :color="page === currentPageUI ? 'primary' : 'secondary'"
                      class="mx-1"
                    >
                      {{ page }}
                    </CButton>
                    <CButton
                      color="secondary"
                      :disabled="currentPageUI === totalPagesUI"
                      @click="currentPageUI++"
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
        <CRow style="margin-bottom: 10px">
          <CCol :md="6"></CCol>
          <CCol :md="1">
            <CButton
              style="margin-bottom: 10px"
              class="btn btn-danger text-light"
              block
              @click="showModalHistoryAnimation()"
            >
              <i class="fa-regular fa-clock">ประวัติ</i>
            </CButton>
          </CCol>
          <CCol :md="3" style="margin-bottom: 10px">
            <CInputGroup>
              <CFormInput
                placeholder="ค้นหา..."
                v-model="searchQueryAnimation"
                @input="fetchQueueAnimation"
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
              @click="showModalCreateAnimation()"
            >
              <i class="fa-solid fa-plus"></i>
              สร้างคิว
            </CButton>
          </CCol>
        </CRow>

        <div class="row">
          <div class="col-md-12">
            <div class="card mb-4">
              <div class="card-header">ตารางคิวงาน Animation</div>
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
                      <th></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(queue, index) in queuesAnimation" :key="queue._id">
                      <td>
                        <span v-if="queue.period === 0" class="text-danger">
                          <i class="fa-solid fa-triangle-exclamation"></i>
                          {{ getQueueNumberAnimation(index) }}
                        </span>
                        <span v-else-if="queue.period === 1" class="text-warning">
                          <i class="fa-solid fa-triangle-exclamation"></i>
                          {{ getQueueNumberAnimation(index) }}
                        </span>
                        <span v-else>
                          &nbsp;&nbsp;&nbsp;{{ getQueueNumberAnimation(index) }}
                        </span>
                      </td>
                      <td>{{ queue.per_name || "N/A" }}</td>
                      <td>{{ queue.client_id || "N/A" }}</td>
                      <td>{{ queue.discordName || "N/A" }}</td>
                      <td>
                        <span v-if="queue.progress_status === 'waiting'">รอคิว</span>
                        <span v-else-if="queue.progress_status === 'in_progress'">กำลังดำเนินงาน</span>
                        <span v-else-if="queue.progress_status === 'completed'">เสร็จสิ้น</span>
                      </td>
                      <td>
                        <span v-if="queue.period === 0" class="text-danger">สิ้นสุดการส่งงาน (กรุณาเพิ่มระยะเวลา)</span>
                        <span v-else>ประมาณ {{ queue.period || 0 }} วัน</span>
                      </td>
                      <td>
                        <CButton
                          color="warning"
                          size="sm"
                          @click="showModalEditAnimation(queue._id)"
                        >
                          <i class="fa-solid fa-pen-to-square"></i> แก้ไขคิว
                        </CButton>
                      </td>
                      <td>
                        <CButton
                          color="success"
                          size="sm"
                          class="text-white"
                          @click="showModalDeleteAnimation(queue._id)"
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
                        v-model="rowsPerPageAnimation"
                        class="form-select mx-2"
                        style="width: auto"
                        @change="fetchQueueAnimation"
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
                      :disabled="currentPageAnimation === 1"
                      @click="currentPageAnimation--"
                    >
                      Previous
                    </CButton>
                    <CButton
                      v-for="page in totalPagesAnimation"
                      :key="page"
                      @click="setPageAnimation(page)"
                      :color="page === currentPageAnimation ? 'primary' : 'secondary'"
                      class="mx-1"
                    >
                      {{ page }}
                    </CButton>
                    <CButton
                      color="secondary"
                      :disabled="currentPageAnimation === totalPagesAnimation"
                      @click="currentPageAnimation++"
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
        <HistoryQueueGraphicComponents @closeModal="closeHistoryGraphicModal" />
      </CModalBody>
    </CModal>

    <CModal
      alignment="center"
      :visible="visibleCreateUIModal"
      @close="closeCreateUIModal"
      aria-labelledby="VerticallyCenteredExampleUI"
      size="lg"
    >
      <CModalHeader>
        <CModalTitle id="VerticallyCenteredExampleUI">สร้างคิวงาน UI</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CreateQueueUIComponents
          :userId="userId.value"
          @closeModal="closeCreateUIModal"
          @queueCreated="fetchQueueUI"
        />
      </CModalBody>
    </CModal>

    <CModal
      alignment="center"
      :visible="visibleEditUIModal"
      @close="closeEditUIModal"
      aria-labelledby="VerticallyCenteredExampleEditUI"
      size="lg"
    >
      <CModalHeader>
        <CModalTitle id="VerticallyCenteredExampleEditUI">แก้ไขคิวงาน UI</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <EditQueueUIComponents
          :userId="userId.value"
          :queueId="selectedQueueId"
          @closeModal="closeEditUIModal"
          @queueUpdated="fetchQueueUI"
        />
      </CModalBody>
    </CModal>

    <CModal
      alignment="center"
      :visible="visibleDeleteUIModal"
      @close="closeDeleteUIModal"
      aria-labelledby="VerticallyCenteredExampleDeleteUI"
      size="lg"
    >
      <CModalHeader>
        <CModalTitle id="VerticallyCenteredExampleDeleteUI">ปิดคิวงาน UI</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <DeleteQueueUIComponents
          :userId="userId.value"
          :queueId="selectedQueueId"
          @closeModal="closeDeleteUIModal"
          @queueUpdated="fetchQueueUI"
        />
      </CModalBody>
    </CModal>

    <CModal
      alignment="center"
      :visible="visibleHistoryUIModal"
      @close="closeHistoryUIModal"
      aria-labelledby="VerticallyCenteredExampleHistoryUI"
      size="lg"
    >
      <CModalHeader>
        <CModalTitle id="VerticallyCenteredExampleHistoryUI">ประวัติคิว UI</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <HistoryQueueUIComponents @closeModal="closeHistoryUIModal" />
      </CModalBody>
    </CModal>

    <CModal
      alignment="center"
      :visible="visibleCreateAnimationModal"
      @close="closeCreateAnimationModal"
      aria-labelledby="VerticallyCenteredExampleAnimation"
      size="lg"
    >
      <CModalHeader>
        <CModalTitle id="VerticallyCenteredExampleAnimation">สร้างคิวงาน Animation</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CreateQueueAnimationComponents
          :userId="userId.value"
          @closeModal="closeCreateAnimationModal"
          @queueCreated="fetchQueueAnimation"
        />
      </CModalBody>
    </CModal>

    <CModal
      alignment="center"
      :visible="visibleEditAnimationModal"
      @close="closeEditAnimationModal"
      aria-labelledby="VerticallyCenteredExampleEditAnimation"
      size="lg"
    >
      <CModalHeader>
        <CModalTitle id="VerticallyCenteredExampleEditAnimation">แก้ไขคิวงาน Animation</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <EditQueueAnimationComponents
          :userId="userId.value"
          :queueId="selectedQueueId"
          @closeModal="closeEditAnimationModal"
          @queueUpdated="fetchQueueAnimation"
        />
      </CModalBody>
    </CModal>

    <CModal
      alignment="center"
      :visible="visibleDeleteAnimationModal"
      @close="closeDeleteAnimationModal"
      aria-labelledby="VerticallyCenteredExampleDeleteAnimation"
      size="lg"
    >
      <CModalHeader>
        <CModalTitle id="VerticallyCenteredExampleDeleteAnimation">ปิดคิวงาน Animation</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <DeleteQueueAnimationComponents
          :userId="userId.value"
          :queueId="selectedQueueId"
          @closeModal="closeDeleteAnimationModal"
          @queueUpdated="fetchQueueAnimation"
        />
      </CModalBody>
    </CModal>

    <CModal
      alignment="center"
      :visible="visibleHistoryAnimationModal"
      @close="closeHistoryAnimationModal"
      aria-labelledby="VerticallyCenteredExampleHistoryAnimation"
      size="lg"
    >
      <CModalHeader>
        <CModalTitle id="VerticallyCenteredExampleHistoryAnimation">ประวัติคิว Animation</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <HistoryQueueAnimationComponents @closeModal="closeHistoryAnimationModal" />
      </CModalBody>
    </CModal>
  </div>
</template>

<script>
import axios from "axios";
import { computed, onMounted, ref, watch } from "vue";
import CreateQueueAnimationComponents from "./AnimationComponents/CreateQueueAnimationComponents.vue";
import DeleteQueueAnimationComponents from "./AnimationComponents/DeleteQueueAnimationComponents.vue";
import EditQueueAnimationComponents from "./AnimationComponents/EditQueueAnimationComponents.vue";
import HistoryQueueAnimationComponents from "./AnimationComponents/HistoryQueueAnimationComponents.vue";
import CreateQueueGraphicComponents from "./GraphicComponents/CreateQueueGraphicComponents.vue";
import DeleteQueueGraphicComponents from "./GraphicComponents/DeleteQueueGraphicComponents.vue";
import EditQueueGraphicComponents from "./GraphicComponents/EditQueueGraphicComponents.vue";
import HistoryQueueGraphicComponents from "./GraphicComponents/HistoryQueueGraphicComponents.vue";
import CreateQueueUIComponents from "./UiComponents/CreateQueueUIComponents.vue";
import DeleteQueueUIComponents from "./UiComponents/DeleteQueueUiComponents.vue";
import EditQueueUIComponents from "./UiComponents/EditQueueUiComponents.vue";
import HistoryQueueUIComponents from "./UiComponents/HistoryQueueUiComponents.vue";

export default {
  name: "QueueComponents",
  components: {
    CreateQueueGraphicComponents,
    EditQueueGraphicComponents,
    DeleteQueueGraphicComponents,
    HistoryQueueGraphicComponents,
    CreateQueueAnimationComponents,
    EditQueueAnimationComponents,
    DeleteQueueAnimationComponents,
    HistoryQueueAnimationComponents,
    CreateQueueUIComponents,
    DeleteQueueUIComponents,
    EditQueueUIComponents,
    HistoryQueueUIComponents,
  },
  setup() {
    const activeTab = ref(localStorage.getItem("activeTab") || "1");
    const searchQuery = ref("");
    const searchQueryUI = ref("");
    const searchQueryAnimation = ref("");
    const rowsPerPage = ref(10);
    const rowsPerPageUI = ref(10);
    const rowsPerPageAnimation = ref(10);
    const currentPage = ref(1);
    const currentPageUI = ref(1);
    const currentPageAnimation = ref(1);
    const license = ref([]);
    const queuesUI = ref([]);
    const queuesAnimation = ref([]);
    const total = ref(0);
    const totalUI = ref(0);
    const totalAnimation = ref(0);
    const totalPages = computed(() => Math.ceil(total.value / rowsPerPage.value));
    const totalPagesUI = computed(() => Math.ceil(totalUI.value / rowsPerPageUI.value));
    const totalPagesAnimation = computed(() => Math.ceil(totalAnimation.value / rowsPerPageAnimation.value));
    const visibleCreateGraphicModal = ref(false);
    const visibleEditGraphicModal = ref(false);
    const visibleDeleteGraphicModal = ref(false);
    const visibleHistoryGraphicModal = ref(false);
    const visibleCreateUIModal = ref(false);
    const visibleEditUIModal = ref(false);
    const visibleDeleteUIModal = ref(false);
    const visibleHistoryUIModal = ref(false);
    const visibleCreateAnimationModal = ref(false);
    const visibleEditAnimationModal = ref(false);
    const visibleDeleteAnimationModal = ref(false);
    const visibleHistoryAnimationModal = ref(false);
    const selectedQueueId = ref(null);
    const userId = ref(localStorage.getItem("userID"));
    const token = ref(localStorage.getItem("token"));

    const setActiveTab = (tab) => {
      activeTab.value = tab;
      localStorage.setItem("activeTab", tab);
      if (tab === "1") {
        fetchQueue();
      }
      if (tab === "2") {
        fetchQueueUI();
      }
      if (tab === "3") {
        fetchQueueAnimation();
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

    const showModalCreateUI = () => {
      visibleCreateUIModal.value = true;
    };

    const closeCreateUIModal = () => {
      visibleCreateUIModal.value = false;
    };

    const showModalEditUI = (queueId) => {
      selectedQueueId.value = queueId;
      visibleEditUIModal.value = true;
    };

    const closeEditUIModal = () => {
      selectedQueueId.value = null;
      visibleEditUIModal.value = false;
    };

    const showModalDeleteUI = (queueId) => {
      selectedQueueId.value = queueId;
      visibleDeleteUIModal.value = true;
    };

    const closeDeleteUIModal = () => {
      selectedQueueId.value = null;
      visibleDeleteUIModal.value = false;
    };

    const showModalHistoryUI = () => {
      visibleHistoryUIModal.value = true;
    };

    const closeHistoryUIModal = () => {
      visibleHistoryUIModal.value = false;
    };

    const showModalCreateAnimation = () => {
      visibleCreateAnimationModal.value = true;
    };

    const closeCreateAnimationModal = () => {
      visibleCreateAnimationModal.value = false;
    };

    const showModalEditAnimation = (queueId) => {
      selectedQueueId.value = queueId;
      visibleEditAnimationModal.value = true;
    };

    const closeEditAnimationModal = () => {
      selectedQueueId.value = null;
      visibleEditAnimationModal.value = false;
    };

    const showModalDeleteAnimation = (queueId) => {
      selectedQueueId.value = queueId;
      visibleDeleteAnimationModal.value = true;
    };

    const closeDeleteAnimationModal = () => {
      selectedQueueId.value = null;
      visibleDeleteAnimationModal.value = false;
    };

    const showModalHistoryAnimation = () => {
      visibleHistoryAnimationModal.value = true;
    };

    const closeHistoryAnimationModal = () => {
      visibleHistoryAnimationModal.value = false;
    };

    const truncateKeyName = (keyName) => {
      if (!keyName) return "";
      return keyName.length > 10 ? keyName.substring(0, 10) + "..." : keyName;
    };

    const getQueueNumber = (index) => {
      return (currentPage.value - 1) * rowsPerPage.value + index + 1;
    };

    const getQueueNumberUI = (index) => {
      return (currentPageUI.value - 1) * rowsPerPageUI.value + index + 1;
    };

    const getQueueNumberAnimation = (index) => {
      return (currentPageAnimation.value - 1) * rowsPerPageAnimation.value + index + 1;
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
      const offset = (currentPageUI.value - 1) * rowsPerPageUI.value;
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/auth/getAllQueueUI", {
          params: {
            limit: rowsPerPageUI.value,
            offset: offset,
            search: searchQueryUI.value,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          queuesUI.value = response.data.data || [];
          totalUI.value = response.data.total || 0;
        } else {
          queuesUI.value = [];
          totalUI.value = 0;
        }
      } catch (error) {
        console.error("Error fetching queue UI:", error);
        queuesUI.value = [];
        totalUI.value = 0;
      }
    };

    const fetchQueueAnimation = async () => {
      const offset = (currentPageAnimation.value - 1) * rowsPerPageAnimation.value;
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/auth/getAllQueueAnimation", {
          params: {
            limit: rowsPerPageAnimation.value,
            offset: offset,
            search: searchQueryAnimation.value,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          queuesAnimation.value = response.data.data || [];
          totalAnimation.value = response.data.total || 0;
        } else {
          queuesAnimation.value = [];
          totalAnimation.value = 0;
        }
      } catch (error) {
        console.error("Error fetching queue animation:", error);
        queuesAnimation.value = [];
        totalAnimation.value = 0;
      }
    };

    const setPage = (page) => {
      currentPage.value = page;
      if (activeTab.value === "1") fetchQueue();
      if (activeTab.value === "2") fetchQueueUI();
    };

    const setPageUI = (page) => {
      currentPageUI.value = page;
      fetchQueueUI();
    };

    const setPageAnimation = (page) => {
      currentPageAnimation.value = page;
      fetchQueueAnimation();
    };

    // โหลด tab และข้อมูลเมื่อหน้าเว็บโหลด
    onMounted(() => {
      if (activeTab.value === "1") {
        fetchQueue();
      } else if (activeTab.value === "2") {
        fetchQueueUI();
      } else if (activeTab.value === "3") {
        fetchQueueAnimation();
      }
    });

    // Watch การเปลี่ยนแปลงของตัวแปรเพื่อเรียก fetch
    watch([searchQuery, rowsPerPage, currentPage], fetchQueue);
    watch([searchQueryUI, rowsPerPageUI, currentPageUI], fetchQueueUI);
    watch([searchQueryAnimation, rowsPerPageAnimation, currentPageAnimation], fetchQueueAnimation);

    return {
      activeTab,
      searchQuery,
      searchQueryUI,
      searchQueryAnimation,
      rowsPerPage,
      rowsPerPageUI,
      rowsPerPageAnimation,
      currentPage,
      currentPageUI,
      currentPageAnimation,
      license,
      queuesUI,
      queuesAnimation,
      total,
      totalUI,
      totalAnimation,
      totalPages,
      totalPagesUI,
      totalPagesAnimation,
      setActiveTab,
      setPage,
      setPageUI,
      setPageAnimation,
      fetchQueue,
      fetchQueueUI,
      fetchQueueAnimation,
      truncateKeyName,
      userId,
      token,
      visibleCreateGraphicModal,
      visibleEditGraphicModal,
      visibleDeleteGraphicModal,
      visibleHistoryGraphicModal,
      visibleCreateUIModal,
      visibleEditUIModal,
      visibleDeleteUIModal,
      visibleHistoryUIModal,
      visibleCreateAnimationModal,
      visibleEditAnimationModal,
      visibleDeleteAnimationModal,
      visibleHistoryAnimationModal,
      showModalCreateGraphic,
      closeCreateGraphicModal,
      showModalEditGraphic,
      closeEditGraphicModal,
      showModalDeleteGraphic,
      closeDeleteGraphicModal,

      showModalHistoryGraphic,
      closeHistoryGraphicModal,
      showModalCreateUI,
      closeCreateUIModal,
      showModalEditUI,
      closeEditUIModal,
      showModalDeleteUI,
      closeDeleteUIModal,
      showModalHistoryUI,
      closeHistoryUIModal,
      showModalCreateAnimation,
      closeCreateAnimationModal,
      showModalEditAnimation,
      closeEditAnimationModal,
      showModalDeleteAnimation,
      closeDeleteAnimationModal,
      showModalHistoryAnimation,
      closeHistoryAnimationModal,
      getQueueNumber,
      getQueueNumberUI,
      getQueueNumberAnimation,
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