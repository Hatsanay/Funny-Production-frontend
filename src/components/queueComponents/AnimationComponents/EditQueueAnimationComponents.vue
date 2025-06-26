<template>
  <CForm class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
    <CCol md="12">
      <CFormLabel>Client ID/ชื่อ Discord</CFormLabel>
      <input
        list="clientList"
        v-model="form.clientId"
        @change="onClientChange"
        class="form-control"
        placeholder="พิมพ์หรือเลือก Client ID/ชื่อ Discord..."
        required
        :class="{ 'is-invalid': errors.clientId }"
        :disabled="true"
      />
      <datalist id="clientList">
        <option
          v-for="client in clientOptions"
          :key="client.clientID"
          :value="client.displayText"
          :disabled="isClientInOrder(client.clientID)"
        >
          {{ client.displayText }}
        </option>
      </datalist>
      <CFormFeedback invalid>{{ errors.clientIdMessage }}</CFormFeedback>
    </CCol>

    <CCol md="12">
      <CFormLabel for="perName">รายละเอียดงาน</CFormLabel>
      <CFormInput
        v-model.trim="form.perName"
        type="text"
        id="perName"
        required
        :class="{ 'is-invalid': errors.perName }"
      />
      <CFormFeedback invalid>{{ errors.perNameMessage }}</CFormFeedback>
    </CCol>

    <CCol md="12">
      <CFormLabel for="progressStatus">สถานะการดำเนินการ</CFormLabel>
      <CFormSelect
        v-model="form.progressStatus"
        id="progressStatus"
        :class="{ 'is-invalid': errors.progressStatus }"
      >
        <option value="" disabled>เลือกสถานะการดำเนินการ</option>
        <option value="waiting">รอคิว</option>
        <option value="in_progress">กำลังดำเนินการ</option>
      </CFormSelect>
      <CFormFeedback invalid>กรุณาเลือกสถานะการดำเนินการ</CFormFeedback>
    </CCol>

    <CCol md="12">
      <CFormLabel for="period">
        ระยะเวลา (วัน)
        <span class="ms-2 text-muted">
          คิวล่าสุด: <strong>{{ latestQueuePeriod }} วัน</strong>
        </span>
      </CFormLabel>
      <div class="d-flex align-items-center">
        <CButton
          color="secondary"
          size="sm"
          @click="decreasePeriod"
          :disabled="period <= 0 || isLoading"
          class="me-2"
        >
          -
        </CButton>
        <CFormInput
          v-model.number="period"
          type="number"
          id="period"
          required
          class="text-center flex-grow-1"
          :min="0"
          :disabled="isLoading"
          :class="{ 'is-invalid': errors.period }"
        />
        <CButton
          color="secondary"
          size="sm"
          @click="increasePeriod"
          :disabled="isLoading"
          class="ms-2"
        >
          +
        </CButton>
      </div>
      <CFormFeedback invalid>ระยะเวลาต้องไม่น้อยกว่า 0 วัน</CFormFeedback>
    </CCol>

    <CCol md="12">
      <CFormLabel>การปรับระยะเวลา</CFormLabel>
      <div class="form-check">
        <CFormCheck
          type="radio"
          id="affectOthersYes"
          v-model="affectOthers"
          value="yes"
          label="มีผลต่อคิวอื่น (เลื่อนคิวถัดไปตาม)"
          required
        />
        <CFormCheck
          type="radio"
          id="affectOthersNo"
          v-model="affectOthers"
          value="no"
          label="ไม่มีผลต่อคิวอื่น (เปลี่ยนเฉพาะคิวนี้)"
          required
        />
      </div>
    </CCol>

    <CCol md="12" class="d-flex justify-content-end mt-3">
      <CButton color="danger" @click="cancelQueueAnimation()" class="me-3 text-white"
        >ยกเลิกคิว</CButton
      >
      <CButton color="secondary" @click="closeModal" class="me-3">ยกเลิก</CButton>
      <CButton type="submit" class="modern-button" :disabled="isLoading">
        {{ isLoading ? "กำลังบันทึก..." : "บันทึก" }}
      </CButton>
    </CCol>

    <CToaster class="p-3" placement="top-end">
      <CToast
        v-for="(toast, index) in toasts"
        :key="index"
        :visible="true"
        :autohide="5000"
      >
        <CToastHeader closeButton>
          <span class="me-auto fw-bold">{{ toast.title }}</span>
          <small class="text-muted">เมื่อ {{ new Date().toLocaleTimeString() }}</small>
        </CToastHeader>
        <CToastBody>{{ toast.content }}</CToastBody>
      </CToast>
    </CToaster>
  </CForm>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import { computed, onMounted, ref, watch } from "vue";

export default {
  name: "EditQueueAnimationComponents",
  props: {
    userId: { type: String, required: true },
    queueId: { type: String, required: true },
    latestQueuePeriod: { type: Number, default: 1 },
    existingClientIds: { type: Array, default: () => [] },
  },
  emits: ["closeModal", "queueUpdated"],

  setup(props, { emit }) {
    const form = ref({
      clientId: "",
      perName: "",
      progressStatus: "",
    });
    const period = ref(0);
    const originalPeriod = ref(0);
    const validated = ref(false);
    const toasts = ref([]);
    const isLoading = ref(false);
    const userId = ref(localStorage.getItem("userID") || props.userId);
    const clientOptions = ref([]);
    const latestQueuePeriod = ref(props.latestQueuePeriod);
    const affectOthers = ref("no");

    const errors = computed(() => ({
      clientId:
        validated.value && (!form.value.clientId || !/^\d+$/.test(form.value.clientId)),
      clientIdMessage: !form.value.clientId ? "กรุณาเลือก Client ID" : "",
      perName:
        validated.value &&
        (!form.value.perName ||
          form.value.perName.length < 2 ||
          form.value.perName.length > 100),
      perNameMessage: !form.value.perName
        ? "กรุณากรอกชื่อผลงาน"
        : form.value.perName.length < 2 || form.value.perName.length > 100
        ? "ชื่อผลงานควรมีความยาว 2-100 ตัวอักษร"
        : "",
      progressStatus: validated.value && !form.value.progressStatus,
      period: validated.value && period.value < 0,
    }));

    const loadQueueData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          addToast("ข้อผิดพลาด", "กรุณาเข้าสู่ระบบก่อนแก้ไข");
          return;
        }
        const response = await axios.get(`/api/auth/getQueueAnimation/${props.queueId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          const queue = response.data.data;
          form.value = {
            clientId: queue.client_id || "",
            perName: queue.per_name || "",
            progressStatus: queue.progress_status || "",
          };
          period.value = queue.period || 0;
          originalPeriod.value = queue.period || 0;
        } else {
          addToast("ข้อผิดพลาด", response.data.error || "ไม่สามารถโหลดข้อมูลคิวได้");
        }
      } catch (error) {
        addToast("ข้อผิดพลาด", error.response?.data?.error || "ไม่สามารถโหลดข้อมูลคิวได้");
        console.error("Error loading queue data:", error.response?.data || error);
      }
    };

    watch(
      () => props.latestQueuePeriod,
      (newPeriod) => {
        latestQueuePeriod.value = newPeriod;
        period.value = Math.max(0, period.value);
      }
    );

    const addToast = (title, content) => {
      toasts.value.push({ title, content });
      if (toasts.value.length > 5) toasts.value.shift();
    };

    const resetForm = () => {
      form.value = { clientId: "", perName: "", progressStatus: "" };
      period.value = latestQueuePeriod.value;
      originalPeriod.value = 0;
      validated.value = false;
      affectOthers.value = "no";
    };

    const increasePeriod = () => {
      if (!isLoading.value) {
        period.value += 1;
      }
    };

    const decreasePeriod = () => {
      if (!isLoading.value && period.value > 0) {
        period.value -= 1;
      }
    };

    const onClientChange = () => {
      const selectedClient = clientOptions.value.find(
        (client) => client.displayText === form.value.clientId
      );
      if (selectedClient) {
        form.value.clientId = selectedClient.clientID;
      } else if (!/^\d+$/.test(form.value.clientId)) {
        form.value.clientId = "";
        addToast("คำเตือน", "กรุณาเลือกจากรายการที่แนะนำ");
      }
    };

    const isClientInOrder = (clientId) => {
      return props.existingClientIds.includes(clientId);
    };

    const loadClientOptions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          addToast("ข้อผิดพลาด", "กรุณาเข้าสู่ระบบก่อนดึงข้อมูล");
          return;
        }
        const response = await axios.get("/api/auth/client-discord", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          clientOptions.value = response.data.data.map((client) => ({
            clientID: client.clientID,
            discordName: client.discordName,
            displayText: `${client.clientID} (${client.discordName})`,
          }));
        } else {
          addToast("ข้อผิดพลาด", response.data.error || "ไม่สามารถโหลดข้อมูล Client ได้");
        }
      } catch (error) {
        addToast("ข้อผิดพลาด", error.response?.data?.error || "ไม่สามารถโหลดข้อมูล Client ได้");
        console.error("Error loading client options:", error.response?.data || error);
      }
    };

    const fetchLatestQueuePeriod = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          addToast("ข้อผิดพลาด", "กรุณาเข้าสู่ระบบก่อนดึงข้อมูล");
          return;
        }
        const response = await axios.get("/api/auth/getAnimationPeriodLastQueue", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.data.success) {
          latestQueuePeriod.value = response.data.data.period || 0;
          period.value = Math.max(0, period.value);
        } else {
          addToast("ข้อผิดพลาด", response.data.error || "ไม่สามารถดึงระยะเวลาคิวล่าสุดได้");
        }
      } catch (error) {
        addToast("ข้อผิดพลาด", error.response?.data?.error || "ไม่สามารถดึงระยะเวลาคิวล่าสุดได้");
        console.error("Error fetching latest queue period:", error.response?.data || error);
      }
    };

    const handleSubmit = async () => {
      if (isLoading.value) return;
      validated.value = true;

      if (Object.values(errors.value).some((error) => !!error)) {
        addToast("คำเตือน", "กรุณาตรวจสอบข้อมูลที่กรอก");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        addToast("ข้อผิดพลาด", "กรุณาเข้าสู่ระบบก่อนบันทึก");
        return;
      }

      isLoading.value = true;
      try {
        const selectedClient = clientOptions.value.find(
          (client) => client.clientID === form.value.clientId
        );
        const discordName = selectedClient ? selectedClient.discordName : "";

        const response = await axios.put(
          `/api/auth/updateQueueAnimation/${props.queueId}`,
          {
            user_id: userId.value,
            client_id: form.value.clientId,
            discordName,
            per_name: form.value.perName,
            progress_status: form.value.progressStatus,
            period: period.value,
            affectOthers: affectOthers.value,
            originalPeriod: originalPeriod.value,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          Swal.fire({
            title: "แก้ไขคิวสำเร็จ",
            text: "แก้ไขคิวงาน Animation เรียบร้อย!",
            icon: "success",
          }).then(() => {
            emit("queueUpdated");
            closeModal();
            window.location.reload();
          });
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "ไม่สามารถแก้ไขคิวได้";
        addToast("ข้อผิดพลาด", errorMessage);
        console.error("Error in handleSubmit:", error.response?.data || error);
      } finally {
        isLoading.value = false;
      }
    };

    const closeModal = () => {
      resetForm();
      emit("closeModal");
    };

    const cancelQueueAnimation = async () => {
      if (isLoading.value) return;

      Swal.fire({
        title: "ยืนยันการยกเลิกคิว",
        text: "คุณแน่ใจหรือไม่ที่จะยกเลิกคิวนี้? การดำเนินการนี้จะมีผลต่อคิวถัดไป",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "ยืนยัน",
        cancelButtonText: "ยกเลิก",
      }).then(async (result) => {
        if (result.isConfirmed) {
          isLoading.value = true;
          try {
            const token = localStorage.getItem("token");
            if (!token) {
              addToast("ข้อผิดพลาด", "กรุณาเข้าสู่ระบบก่อนยกเลิก");
              return;
            }

            const selectedClient = clientOptions.value.find(
              (client) => client.clientID === form.value.clientId
            );
            const discordName = selectedClient ? selectedClient.discordName : "";

            const response = await axios.put(
              `/api/auth/cancelQueueAnimation/${props.queueId}`,
              {
                user_id: userId.value,
                client_id: form.value.clientId,
                discordName,
                per_name: form.value.perName,
                progress_status: "cancel",
                period: period.value,
                affectOthers: affectOthers.value,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.status === 200) {
              Swal.fire({
                title: "ยกเลิกคิวสำเร็จ",
                text: "คิวงานถูกยกเลิกเรียบร้อย!",
                icon: "success",
              }).then(() => {
                emit("queueUpdated");
                closeModal();
                window.location.reload();
              });
            }
          } catch (error) {
            const errorMessage =
              error.response?.data?.error ||
              error.response?.data?.message ||
              error.message ||
              "ไม่สามารถยกเลิกคิวได้";
            addToast("ข้อผิดพลาด", errorMessage);
            console.error("Error in cancelQueueAnimation:", error.response?.data || error);
          } finally {
            isLoading.value = false;
          }
        }
      });
    };

    onMounted(async () => {
      await fetchLatestQueuePeriod();
      await loadClientOptions();
      await loadQueueData();
    });

    return {
      form,
      period,
      validated,
      toasts,
      isLoading,
      userId,
      errors,
      handleSubmit,
      closeModal,
      increasePeriod,
      decreasePeriod,
      clientOptions,
      onClientChange,
      isClientInOrder,
      latestQueuePeriod,
      affectOthers,
      cancelQueueAnimation,
    };
  },
};
</script>

<style scoped>
.is-invalid {
  border-color: #dc3545;
}
.text-center {
  max-width: 100px;
}
.text-muted {
  font-size: 0.9em;
}
.me-2,
.ms-2 {
  margin: 0 0.5rem;
}
.mt-3 {
  margin-top: 1rem;
}
.form-control.is-invalid {
  border-color: #dc3545;
  background-image: none;
}
.text-muted strong {
  color: #0d6efd;
  font-weight: 600;
}
</style>