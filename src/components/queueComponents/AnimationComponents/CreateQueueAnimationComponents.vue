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
      <CFormLabel for="period"
        >ระยะเวลา (วัน)
        <span class="ms-2 text-muted"
          >คิวล่าสุด: <strong>{{ latestQueuePeriod }} วัน</strong></span>
      </CFormLabel>
      <div class="d-flex align-items-center">
        <CButton
          color="secondary"
          size="sm"
          @click="decreasePeriod"
          :disabled="period <= latestQueuePeriod || isLoading"
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
          :min="latestQueuePeriod"
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
      <CFormFeedback invalid>
        ระยะเวลาต้องไม่น้อยกว่าคิวล่าสุด ({{ latestQueuePeriod }} วัน)
      </CFormFeedback>
    </CCol>

    <CCol md="12" class="d-flex justify-content-end mt-3">
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
  name: "CreateQueueGraphicComponents",
  props: {
    userId: { type: String, required: true },
    latestQueuePeriod: { type: Number, default: 1 },
    existingClientIds: { type: Array, default: () => [] },
  },
  emits: ["closeModal", "queueCreated"],

  setup(props, { emit }) {
    const form = ref({
      clientId: "",
      perName: "",
      progressStatus: "",
    });
    const period = ref(props.latestQueuePeriod);
    const validated = ref(false);
    const toasts = ref([]);
    const isLoading = ref(false);
    const userId = ref(localStorage.getItem("userID") || props.userId);
    const clientOptions = ref([]);
    const latestQueuePeriod = ref(props.latestQueuePeriod); 

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
      progressStatus: false,
      period: validated.value && period.value < latestQueuePeriod.value,
    }));

    watch(
      () => props.latestQueuePeriod,
      (newPeriod) => {
        latestQueuePeriod.value = newPeriod; 
        period.value = Math.max(newPeriod, period.value);
      }
    );

    const addToast = (title, content) => {
      toasts.value.push({ title, content });
      if (toasts.value.length > 5) toasts.value.shift();
    };

    const resetForm = () => {
      form.value = { clientId: "", perName: "", progressStatus: "" };
      period.value = latestQueuePeriod.value;
      validated.value = false;
    };

    const increasePeriod = () => {
      period.value += 1;
    };

    const decreasePeriod = () => {
      if (period.value > latestQueuePeriod.value ) period.value -= 1;
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
        const response = await axios.get("/api/auth/client-discord", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          clientOptions.value = response.data.data.map((client) => ({
            clientID: client.clientID,
            discordName: client.discordName,
            displayText: `${client.clientID} (${client.discordName})`,
          }));
        }
      } catch (error) {
        addToast("ข้อผิดพลาด", "ไม่สามารถโหลดข้อมูล Client ได้");
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
          latestQueuePeriod.value = response.data.data.period;
          period.value = Math.max(latestQueuePeriod.value, period.value);
        }
      } catch (error) {
        addToast("ข้อผิดพลาด", "ไม่สามารถดึงระยะเวลาคิวล่าสุดได้");
        console.error("Error fetching latest queue period:", error);
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
        addToast("ข้อผิดพลาด", "กรุณาเข้าสู่ระบบก่อนสร้างคิว");
        return;
      }

      isLoading.value = true;
      try {
        const selectedClient = clientOptions.value.find(
          (client) => client.clientID === form.value.clientId
        );
        const discordName = selectedClient ? selectedClient.discordName : "";

        const response = await axios.post(
          "/api/auth/createQueueAnimation",
          {
            user_id: userId.value,
            client_id: form.value.clientId,
            discordName,
            per_name: form.value.perName,
            progress_status: form.value.progressStatus || "waiting",
            period: period.value,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 201) {
          Swal.fire({
            title: "สร้างคิวสำเร็จ",
            text: "สร้างคิวงาน Graphic เรียบร้อย!",
            icon: "success",
          }).then(() => {
            window.location.reload();
          });
          emit("queueCreated", response.data.data);
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "ไม่สามารถสร้างคิวได้";
        addToast("ข้อผิดพลาด", errorMessage);
      } finally {
        isLoading.value = false;
      }
    };

    const closeModal = () => {
      resetForm();
      emit("closeModal");
    };

    onMounted(async () => {
      await fetchLatestQueuePeriod();
      loadClientOptions();
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
  background-image: none; /* ปิด background validation ของ Bootstrap */
}

/* เพิ่มสไตล์เพื่อเน้นระยะเวลาคิวล่าสุด */
.text-muted strong {
  color: #0d6efd; /* สีน้ำเงินเพื่อเน้น */
  font-weight: 600;
}
</style>