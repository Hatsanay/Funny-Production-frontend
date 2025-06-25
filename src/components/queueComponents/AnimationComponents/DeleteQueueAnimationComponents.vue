<template>
  <CForm class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
    <CCol md="12">
      <!-- <CFormLabel>การเปลี่ยนสถานะคิว</CFormLabel> -->
      <p>คิวนี้จะถูกตั้งเป็นเสร็จสิ้น</p>
      <div class="form-check">
        <CFormCheck
          type="radio"
          id="affectOthersYes"
          v-model="affectOthers"
          value="yes"
          label="มีผลต่อคิวอื่น (ลดระยะเวลาของคิวอื่น ต่ำสุดเหลือ 1 วัน)"
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

    <CCol md="12" class="d-flex justify-content-end mt-4">
      <CButton color="secondary" @click="closeModal" class="me-3">ยกเลิก</CButton>
      <CButton type="submit" class="modern-button" :disabled="isLoading">
        {{ isLoading ? "กำลังดำเนินการ..." : "ยืนยันการเสร็จสิ้นคิว" }}
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
import { onMounted, ref } from "vue";

export default {
  name: "DeleteQueueAnimationComponents",
  props: {
    userId: { type: String, required: true },
    queueId: { type: String, required: true },
  },
  emits: ["closeModal", "queueUpdated"],

  setup(props, { emit }) {
    const form = ref({
      clientId: "",
      perName: "",
    });
    const toasts = ref([]);
    const isLoading = ref(false);
    const userId = ref(localStorage.getItem("userID") || props.userId);
    const affectOthers = ref("no");

    const loadQueueData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`/api/auth/getQueueAnimation/${props.queueId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          const queue = response.data.data;
          form.value = {
            clientId: queue.client_id,
            perName: queue.per_name,
          };
        }
      } catch (error) {
        addToast("ข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลคิวได้");
        console.error("Error loading queue data:", error);
      }
    };

    const addToast = (title, content) => {
      toasts.value.push({ title, content });
      if (toasts.value.length > 5) toasts.value.shift();
    };

    const closeModal = () => {
      emit("closeModal");
    };

    const handleSubmit = async () => {
      if (isLoading.value) return;

      const token = localStorage.getItem("token");
      if (!token) {
        addToast("ข้อผิดพลาด", "กรุณาเข้าสู่ระบบก่อนบันทึก");
        return;
      }

      isLoading.value = true;
      try {
        const confirmResult = await Swal.fire({
          title: "ยืนยันการเปลี่ยนสถานะคิว",
          text: "คุณแน่ใจหรือไม่ว่าต้องการตั้งคิวนี้เป็นเสร็จสิ้น? การดำเนินการนี้ไม่สามารถย้อนกลับได้",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "ยืนยัน",
          cancelButtonText: "ยกเลิก",
        });

        if (confirmResult.isConfirmed) {
          const updateResponse = await axios.put(
            `/api/auth/deleteQueueAnimation/${props.queueId}`,
            {
              user_id: userId.value,
              client_id: form.value.clientId,
              discordName: "",
              per_name: form.value.perName,
              progress_status: "completed",
              period: 0,
              affectOthers: affectOthers.value,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (updateResponse.status === 200) {
            Swal.fire({
              title: "เปลี่ยนสถานะคิวสำเร็จ",
              text: "คิวงาน Animation ถูกตั้งเป็นเสร็จสิ้นเรียบร้อย!",
              icon: "success",
            }).then(() => {
              emit("queueUpdated");
              closeModal();
              window.location.reload();
            });
          }
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "ไม่สามารถเปลี่ยนสถานะคิวได้";
        addToast("ข้อผิดพลาด", errorMessage);
        console.error("Error in handleSubmit:", error.response?.data || error);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(async () => {
      await loadQueueData();
    });

    return {
      form,
      toasts,
      isLoading,
      userId,
      affectOthers,
      handleSubmit,
      closeModal,
    };
  },
};
</script>

<style scoped>
.me-2,
.ms-2 {
  margin: 0 0.5rem;
}

.mt-4 {
  margin-top: 1.5rem;
}
</style>