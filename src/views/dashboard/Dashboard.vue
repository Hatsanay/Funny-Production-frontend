<template>
  <div>
    <ul class="nav nav-tabs">
      <li v-if="showTab1" class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === '1' }"
          @click.prevent="switchTab('1')"
          href="#"
        >
          Dashboard
        </a>
      </li>
      <li v-if="showTab2" class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === '2' }"
          @click.prevent="switchTab('2')"
          href="#"
        >
          Dashboard
        </a>
      </li>
      <li v-if="showTab3" class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === '3' }"
          @click.prevent="switchTab('3')"
          href="#"
        >
          Dashboard
        </a>
      </li>
      <li v-if="showTab4" class="nav-item">
        <a
          class="nav-link"
          :class="{ active: activeTab === '4' }"
          @click.prevent="switchTab('4')"
          href="#"
        >
          Dashboard
        </a>
      </li>
    </ul>

    <div class="tab-content mt-3">
      <!--DashBoard ของผู้ใช้-->
      <div v-if="showTab1 && activeTab === '1'" class="tab-pane active">
        <CRow>
          <CCol :md="3">
            <CCard color="primary" class="text-white mb-4">
              <CCardBody>
                <div class="text-value">{{ items.InprogressCount || 0 }}</div>
                <div>จำนวนการแจ้งซ่อมที่กำลังดำเนินการ</div>
                <small class="text-white-50">({{ items.inprogressPercent || 0 }}%)</small>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol :md="3">
            <CCard color="info" class="text-white mb-4">
              <CCardBody>
                <div class="text-value">{{ items.ScheduledCount || 0 }}</div>
                <div>จำนวนการแจ้งซ่อมที่นัดแล้ว</div>
                <small class="text-white-50">({{ items.scheduledPercent || 0 }}%)</small>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol :md="3">
            <CCard color="warning" class="text-white mb-4">
              <CCardBody>
                <div class="text-value">{{ items.CompletedCount || 0 }}</div>
                <div>จำนวนการแจ้งซ่อมที่เสร็จสิ้น</div>
                <small class="text-white-50">({{ items.completedPercent || 0 }}%)</small>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol :md="3">
            <CCard color="danger" class="text-white mb-4">
              <CCardBody>
                <div class="text-value">{{ items.TotalCount || 0 }}</div>
                <div>จำนวนการแจ้งซ่อมทั้งหมด</div>
                <small class="text-white-50">(100%)</small>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CRow>
          <CCol :md="12">
            <CCard>
              <CCardBody>
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h4 id="traffic" class="card-title mb-0">จำนวนการแจ้งซ่อม</h4>
                  </div>
                  <CButtonGroup class="float-end">
                    <CButton
                      color="secondary"
                      @click="setTimeRange('day')"
                      :active="timeRange === 'day'"
                      >วัน</CButton
                    >
                    <CButton
                      color="secondary"
                      @click="setTimeRange('month')"
                      :active="timeRange === 'month'"
                      >เดือน</CButton
                    >
                    <CButton
                      color="secondary"
                      @click="setTimeRange('year')"
                      :active="timeRange === 'year'"
                      >ปี</CButton
                    >
                  </CButtonGroup>
                </div>
                <CChartLine
                  :data="lineChartData"
                  :options="lineChartOptions"
                  style="height: 300px; max-height: 300px; margin-top: 20px"
                />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </div>
      <!--DashBoard ของนิติ-->
      <div v-if="showTab2 && activeTab === '2'" class="tab-pane active">
        <CRow>
          <CCol :md="3">
            <CCard color="primary" class="text-white mb-4">
              <CCardBody>
                <div class="text-value">{{ itemsNiti.InprogressCount || 0 }}</div>
                <div>จำนวนการแจ้งซ่อมที่รอตรวจสอบ</div>
                <small class="text-white-50"
                  >({{ itemsNiti.InprogressCount || 0 }}%)</small
                >
              </CCardBody>
            </CCard>
          </CCol>

          <CCol :md="3">
            <CCard color="info" class="text-white mb-4">
              <CCardBody>
                <div class="text-value">{{ itemsNiti.ScheduleCount || 0 }}</div>
                <div>จำนวนการแจ้งซ่อมที่รอนัด</div>
                <small class="text-white-50"
                  >({{ itemsNiti.ScheduleCountPercent || 0 }}%)</small
                >
              </CCardBody>
            </CCard>
          </CCol>

          <CCol :md="3">
            <CCard color="warning" class="text-white mb-4">
              <CCardBody>
                <div class="text-value">{{ itemsNiti.CompletedCount || 0 }}</div>
                <div>จำนวนการแจ้งซ่อมที่เสร็จสิ้น</div>
                <small class="text-white-50"
                  >({{ itemsNiti.CompletedCountPercent || 0 }}%)</small
                >
              </CCardBody>
            </CCard>
          </CCol>

          <CCol :md="3">
            <CCard color="danger" class="text-white mb-4">
              <CCardBody>
                <div class="text-value">{{ itemsNiti.TotalCount || 0 }}</div>
                <div>จำนวนการแจ้งซ่อมทั้งหมด</div>
                <small class="text-white-50">(100%)</small>
              </CCardBody>
            </CCard>
          </CCol>
          <CRow>
            <CCol :md="5">
              <CCard>
                <CCardBody>
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h4 id="traffic" class="card-title mb-0">
                        จำนวนการแจ้งเบิกอุปกรณ์
                      </h4>
                    </div>
                  </div>
                  <div style="height: 200px; width: 100%; padding: 20px">
                    <CChartPie
                      v-if="PieChartDataNiti.datasets.length > 0"
                      :data="PieChartDataNiti"
                      :options="PieChartOptionsPie"
                      style="height: 150px"
                    />
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol :md="7">
              <CCard>
                <div class="low-stock-container">
                  <h2>อุปกรณ์ใกล้หมด</h2>
                  <div class="table-wrapper">
                    <table class="low-stock-table">
                      <thead>
                        <tr>
                          <th>รหัสอุปกรณ์</th>
                          <th>ชื่ออุปกรณ์</th>
                          <th>จำนวนคงเหลือ</th>
                          <th>หน่วยนับ</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in lowStockItems" :key="item.ID">
                          <td>{{ item.ID }}</td>
                          <td>{{ item.name }}</td>
                          <td>{{ item.quantity }}</td>
                          <td>{{ item.unit }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CCard>
            </CCol>
          </CRow>
        </CRow>
      </div>
      <!--DashBoard ของช่าง-->
      <div v-if="showTab3 && activeTab === '3'" class="tab-pane active">
        <CRow>
          <!-- <CCol :md="12" class="text-center"> Dashboard ช่าง ---กำลังพัฒนา--- 
            <CButton
            color="primary"
            class="w-80"
            block
            style="margin: 100px"
            @click="$router.push('/macMgnReqView')"
            >ไปหน้าคำร้องขอแจ้งซ่อม</CButton
          >
          </CCol> -->
          <CCol :md="3">
            <CCard color="primary" class="text-white mb-4">
              <CCardBody>
                <div class="text-value">{{ itemscount.InprogressCount || 0 }}</div>
                <div>จำนวนการแจ้งซ่อมที่รอประเมิน</div>
                <small class="text-white-50"
                  >({{ itemscount.InprogressCountpercent || 0 }}%)</small
                >
              </CCardBody>
            </CCard>
          </CCol>
          <CCol :md="3">
            <CCard color="info" class="text-white mb-4">
              <CCardBody>
                <div class="text-value">{{ itemsMac.ScheduledCount || 0 }}</div>
                <div>จำนวนการแจ้งซ่อมที่นัดแล้ว</div>
                <small class="text-white-50"
                  >({{ itemsMac.scheduledPercent || 0 }}%)</small
                >
              </CCardBody>
            </CCard>
          </CCol>
          <CCol :md="3">
            <CCard color="warning" class="text-white mb-4">
              <CCardBody>
                <div class="text-value">{{ itemsMac.CompletedCount || 0 }}</div>
                <div>จำนวนการแจ้งซ่อมที่เสร็จสิ้น</div>
                <small class="text-white-50"
                  >({{ itemsMac.completedPercent || 0 }}%)</small
                >
              </CCardBody>
            </CCard>
          </CCol>
          <CCol :md="3">
            <CCard color="danger" class="text-white mb-4">
              <CCardBody>
                <div class="text-value">{{ itemsMac.TotalCount || 0 }}</div>
                <div>จำนวนการแจ้งซ่อมทั้งหมด</div>
                <small class="text-white-50">(100%)</small>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CRow>
          <CCol :md="12">
            <CCard>
              <CCardBody>
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h4 id="traffic1" class="card-title mb-0">จำนวนการแจ้งซ่อม</h4>
                  </div>
                  <CButtonGroup class="float-end">
                    <CButton
                      color="secondary"
                      @click="setTimeRange('day')"
                      :active="timeRange === 'day'"
                      >วัน</CButton
                    >
                    <CButton
                      color="secondary"
                      @click="setTimeRange('month')"
                      :active="timeRange === 'month'"
                      >เดือน</CButton
                    >
                    <CButton
                      color="secondary"
                      @click="setTimeRange('year')"
                      :active="timeRange === 'year'"
                      >ปี</CButton
                    >
                  </CButtonGroup>
                </div>
                <CChartLine
                  :data="lineChartDataMac"
                  :options="lineChartOptions"
                  style="height: 300px; max-height: 300px; margin-top: 20px"
                />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </div>
      <!--DashBoard ผู้จัดการ-->
      <div v-if="showTab4 && activeTab === '4'" class="tab-pane active">
        <CRow>
          <CCol :md="3">
            <CCard color="primary" class="text-white mb-4">
              <CCardBody>
                <div class="text-value">{{ itemscountManager.InprogressCount || 0 }}</div>
                <div>รายการใบสั่งซื้อที่ยังไม่อนุมัติ</div>
                <small class="text-white-50"
                  >({{ itemscountManager.InprogressCountpercent || 0 }}%)</small
                >
              </CCardBody>
            </CCard>
          </CCol>

          <CCol :md="3">
            <CCard color="info" class="text-white mb-4">
              <CCardBody>
                <div class="text-value">{{ itemsManager.CommitCount || 0 }}</div>
                <div>รายการใบสั่งซื้อที่อนุมัติแล้ว</div>
                <small class="text-white-50"
                  >({{ itemsManager.CommitCountPercent || 0 }}%)</small
                >
              </CCardBody>
            </CCard>
          </CCol>

          <CCol :md="3">
            <CCard color="danger" class="text-white mb-4">
              <CCardBody>
                <div class="text-value">{{ itemsManager.TotalCount || 0 }}</div>
                <div>จำนวนรายการใบสั่งซื้อทั้งหมด</div>
                <small class="text-white-50">(100%)</small>
              </CCardBody>
            </CCard>
          </CCol>

          <!-- <CCol :md="3">
            <CCard color="danger" class="text-white mb-4">
              <CCardBody>
                <div class="text-value">{{ items.TotalCount || 0 }}</div>
                <div>จำนวนการแจ้งซ่อมทั้งหมด</div>
                <small class="text-white-50">(100%)</small>
              </CCardBody>
            </CCard>
          </CCol> -->
        </CRow>
        <CRow>
          <CCol :md="12">
            <CCard>
              <CCardBody>
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h4 id="traffic" class="card-title mb-0">จำนวนใบสั่งซื้อทั้งหมด</h4>
                  </div>
                  <CButtonGroup class="float-end">
                    <CButton
                      color="secondary"
                      @click="setTimeRange('day')"
                      :active="timeRange === 'day'"
                      >วัน</CButton
                    >
                    <CButton
                      color="secondary"
                      @click="setTimeRange('month')"
                      :active="timeRange === 'month'"
                      >เดือน</CButton
                    >
                    <CButton
                      color="secondary"
                      @click="setTimeRange('year')"
                      :active="timeRange === 'year'"
                      >ปี</CButton
                    >
                  </CButtonGroup>
                </div>
                <CChartLine
                  :data="lineChartDataManager"
                  :options="lineChartOptions"
                  style="height: 300px; max-height: 300px; margin-top: 20px"
                />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CButtonGroup,
  CButton,
  CCardFooter,
} from "@coreui/vue";
import { CChartLine } from "@coreui/vue-chartjs";
import axios from "axios";
import { nextTick } from "vue";
import { CChartPie } from "@coreui/vue-chartjs";
import { CChart } from "@coreui/vue-chartjs";

export default {
  name: "Dashboard",
};
</script>

<style scoped>
.text-value {
  font-size: 1.5rem;
  font-weight: bold;
}
.low-stock-container {
  max-width: 100%;
  margin: 20px;
}

.table-wrapper {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.low-stock-table {
  width: 100%;
  border-collapse: collapse;
}

.low-stock-table th {
  position: sticky;
  top: 0;
  background-color: #f5f5f5;
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #ddd;
}

.low-stock-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.low-stock-table tr:last-child td {
  border-bottom: none;
}

.status-out {
  color: white;
  background-color: #ff4444;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
}

.status-low {
  color: white;
  background-color: #ffbb33;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
}
</style>
