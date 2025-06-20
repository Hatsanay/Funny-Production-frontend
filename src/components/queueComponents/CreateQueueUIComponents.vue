<template>
  <CForm class="row g-3 needs-validation" novalidate @submit.prevent="handleSubmit">
    <CCol md="12">
      <CFormLabel for="perName">ชื่อผลงาน</CFormLabel>
      <CFormInput
        v-model="perName"
        type="text"
        id="perName"
        required
        :class="{ 'is-invalid': isPerNameInvalid }"
      />
      <CFormFeedback invalid>
        {{ perNameErrorMessage }}
      </CFormFeedback>
    </CCol>

    <CCol md="12">
      <CFormLabel for="perDes">รายละเอียด</CFormLabel>
      <CFormTextarea
        v-model="perDes"
        id="perDes"
        rows="4"
        required
        :class="{ 'is-invalid': isPerDesInvalid }"
      />
      <CFormFeedback invalid>
        {{ perDesErrorMessage }}
      </CFormFeedback>
    </CCol>

    <hr />

    <CCol md="12">
      <CFormLabel for="perProfile">อัปโหลดรูปหน้าปก (จำเป็น)</CFormLabel>
      <div
        class="upload-area"
        @dragover.prevent="onDragOver($event, 'perProfile')"
        @dragleave.prevent="onDragLeave($event, 'perProfile')"
        @drop.prevent="onDrop($event, 'perProfile')"
        :class="{ 'drag-over': dragOver.perProfile }"
      >
        <CFormInput
          type="file"
          id="perProfile"
          accept="image/jpeg,image/jpg,image/png,image/gif"
          @change="onFileChange($event, 'perProfile')"
          hidden
        />
        <label for="perProfile" class="upload-label">
          <i class="fa-solid fa-upload"></i>
          <span>คลิกเพื่อเลือกไฟล์ หรือลากและวางที่นี่</span>
        </label>
      </div>
      <CFormFeedback invalid v-if="isPerProfileInvalid">
        {{ perProfileErrorMessage }}
      </CFormFeedback>

      <div v-if="perProfilePreview" class="preview-container mt-2">
        <div class="preview-item">
          <img :src="perProfilePreview" alt="Profile Preview" class="preview-image" />
          <CButton color="secondary" size="sm" @click="removeFile('perProfile')">
            <i class="fa-solid fa-xmark"></i>
          </CButton>
        </div>
      </div>
    </CCol>

    <hr />

    <CCol md="12">
      <CFormLabel for="additionalImages"
        >อัปโหลดรูปภาพเพิ่มเติม (ถ้ามี, สูงสุด 100 รูป)</CFormLabel
      >
      <div
        class="upload-area"
        @dragover.prevent="onDragOver($event, 'additionalImages')"
        @dragleave.prevent="onDragLeave($event, 'additionalImages')"
        @drop.prevent="onDrop($event, 'additionalImages')"
        :class="{ 'drag-over': dragOver.additionalImages }"
      >
        <CFormInput
          type="file"
          id="additionalImages"
          accept="image/jpeg,image/jpg,image/png,image/gif"
          multiple
          @change="onFileChange($event, 'additionalImages')"
          hidden
        />
        <label for="additionalImages" class="upload-label">
          <i class="fa-solid fa-upload"></i>
          <span>คลิกเพื่อเลือกไฟล์ หรือลากและวางที่นี่</span>
        </label>
      </div>

      <div v-if="additionalImagesPreviews.length" class="preview-container mt-2">
        <div
          v-for="(preview, index) in additionalImagesPreviews"
          :key="index"
          class="preview-item"
        >
          <img :src="preview" alt="Additional Image Preview" class="preview-image" />
          <CButton
            color="danger"
            size="sm"
            @click="removeFile('additionalImages', index)"
          >
            <i class="fa-solid fa-trash"></i>
          </CButton>
        </div>
      </div>
    </CCol>

    <!-- ปุ่ม -->
    <CCol md="12" class="d-flex justify-content-end">
      <CButton color="secondary" @click="closeModal" class="me-2">ยกเลิก</CButton>
      <CButton type="submit" color="primary" :disabled="isLoading">
        {{ isLoading ? "กำลังบันทึก..." : "บันทึก" }}
      </CButton>
    </CCol>

    <CToaster class="p-3" placement="top-end">
      <CToast v-for="(toast, index) in toasts" :key="index" visible :autohide="5000">
        <CToastHeader closeButton>
          <span class="me-auto fw-bold">{{ toast.title }}</span>
        </CToastHeader>
        <CToastBody>{{ toast.content }}</CToastBody>
      </CToast>
    </CToaster>
  </CForm>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import { computed, onUnmounted, ref } from "vue";

export default {
  name: "CreateQueueUIComponents",
  props: {
    userId: { type: String, required: true },
  },
  emits: ["closeModal", "performanceCreated"],
  setup(props, { emit }) {
    const perName = ref("");
    const perDes = ref("");
    const perProfile = ref(null);
    const perProfilePreview = ref(null);
    const additionalImages = ref([]);
    const additionalImagesPreviews = ref([]);
    const validated = ref(false);
    const toasts = ref([]);
    const dragOver = ref({ perProfile: false, additionalImages: false });
    const isLoading = ref(false);
    const userId = ref(localStorage.getItem("userID"));

    const isPerNameInvalid = computed(
      () =>
        validated.value &&
        (perName.value.trim() === "" ||
          perName.value.length < 2 ||
          perName.value.length > 100)
    );
    const perNameErrorMessage = computed(() => {
      if (perName.value.trim() === "") return "กรุณากรอกชื่อผลงาน";
      if (perName.value.length < 2 || perName.value.length > 100)
        return "ชื่อผลงานควรมีความยาวระหว่าง 2 ถึง 100 ตัวอักษร";
      return "";
    });

    const isPerDesInvalid = computed(
      () =>
        validated.value &&
        (perDes.value.trim() === "" ||
          perDes.value.length < 2 ||
          perDes.value.length > 500)
    );
    const perDesErrorMessage = computed(() => {
      if (perDes.value.trim() === "") return "กรุณากรอกรายละเอียด";
      if (perDes.value.length < 2 || perDes.value.length > 500)
        return "รายละเอียดควรมีความยาวระหว่าง 2 ถึง 500 ตัวอักษร";
      return "";
    });

    const isPerProfileInvalid = computed(() => validated.value && !perProfile.value);
    const perProfileErrorMessage = computed(() =>
      isPerProfileInvalid.value ? "กรุณาอัปโหลดรูปหน้าปก" : ""
    );

    const addToast = (title, content) => {
      toasts.value.push({ title, content });
      if (toasts.value.length > 5) toasts.value.shift(); // Limit to 5 toasts
    };

    const isValidImage = (file) => file.type.match(/image\/(jpeg|jpg|png|gif)/);
    const isFileSizeValid = (file) => file.size <= 5 * 1024 * 1024; // 5MB limit
    const isTotalSizeValid = (files) => {
      const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);
      const currentTotalSize = additionalImages.value.reduce(
        (sum, file) => sum + file.size,
        0
      );
      return totalSize + currentTotalSize <= 100 * 1024 * 1024; // 100MB limit
    };
    const isFileDuplicate = (file) =>
      additionalImages.value.some(
        (existing) => existing.name === file.name && existing.size === file.size
      );

    const onDragOver = (event, type) => {
      dragOver.value[type] = true;
    };
    const onDragLeave = (event, type) => {
      dragOver.value[type] = false;
    };
    const onDrop = (event, type) => {
      dragOver.value[type] = false;
      handleFiles(event.dataTransfer.files, type);
    };

    const onFileChange = (event, type) => {
      handleFiles(event.target.files, type);
    };

    const handleFiles = (files, type) => {
      if (type === "perProfile") {
        const file = files[0];
        if (!file) return;
        if (!isValidImage(file)) {
          addToast(
            "ข้อผิดพลาด",
            "รูปหน้าปกต้องเป็นไฟล์ภาพ (jpeg, jpg, png, gif) เท่านั้น"
          );
          return;
        }
        if (!isFileSizeValid(file)) {
          addToast("ข้อผิดพลาด", "ขนาดไฟล์รูปหน้าปกต้องไม่เกิน 5MB");
          return;
        }
        perProfile.value = file;
        perProfilePreview.value = URL.createObjectURL(file);
      } else {
        if (!isTotalSizeValid(files)) {
          addToast("ข้อผิดพลาด", "ขนาดไฟล์รวมต้องไม่เกิน 100MB");
          return;
        }
        const newFiles = Array.from(files).filter((file) => {
          if (!isValidImage(file)) {
            addToast(
              "ข้อผิดพลาด",
              "รูปภาพเพิ่มเติมต้องเป็นไฟล์ภาพ (jpeg, jpg, png, gif) เท่านั้น"
            );
            return false;
          }
          if (!isFileSizeValid(file)) {
            addToast("ข้อผิดพลาด", "ขนาดไฟล์รูปภาพเพิ่มเติมต้องไม่เกิน 5MB");
            return false;
          }
          if (isFileDuplicate(file)) {
            addToast("ข้อผิดพลาด", `ไฟล์ ${file.name} ถูกอัปโหลดแล้ว`);
            return false;
          }
          return true;
        });

        if (additionalImages.value.length + newFiles.length > 100) {
          addToast("ข้อผิดพลาด", "สามารถอัปโหลดรูปภาพเพิ่มเติมได้สูงสุด 100 รูป");
          return;
        }

        additionalImages.value = [...additionalImages.value, ...newFiles];
        additionalImagesPreviews.value = [
          ...additionalImagesPreviews.value,
          ...newFiles.map((file) => URL.createObjectURL(file)),
        ];
      }
    };

    const removeFile = (type, index = null) => {
      if (type === "perProfile") {
        if (perProfilePreview.value) URL.revokeObjectURL(perProfilePreview.value);
        perProfile.value = null;
        perProfilePreview.value = null;
      } else {
        URL.revokeObjectURL(additionalImagesPreviews.value[index]);
        additionalImages.value.splice(index, 1);
        additionalImagesPreviews.value.splice(index, 1);
      }
    };

    const handleSubmit = async () => {
      if (isLoading.value) return;
      validated.value = true;

      if (isPerNameInvalid.value || isPerDesInvalid.value || isPerProfileInvalid.value)
        return;

      const token = localStorage.getItem("token");
      if (!token) {
        addToast("ข้อผิดพลาด", "กรุณาเข้าสู่ระบบก่อนสร้างผลงาน");
        return;
      }

      isLoading.value = true;
      try {
        const formData = new FormData();
        formData.append("user_id", userId.value);
        formData.append("per_name", perName.value);
        formData.append("per_des", perDes.value);
        formData.append("perProfile", perProfile.value);
        additionalImages.value.forEach((file) =>
          formData.append("additionalImages", file)
        );

        const response = await axios.post("/api/auth/createPerformance", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 201) {
          Swal.fire({
            title: "สร้างผลงาน",
            text: "สร้างผลงานเรียบร้อย!",
            icon: "success",
          }).then(() => {
            window.location.reload();
          });
        }

        resetForm();
        emit("performanceCreated");
        emit("closeModal");
      } catch (error) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "ไม่สามารถสร้างผลงานได้";
        addToast("ข้อผิดพลาด", errorMessage);
      } finally {
        isLoading.value = false;
      }
    };

    const resetForm = () => {
      perName.value = "";
      perDes.value = "";
      if (perProfilePreview.value) URL.revokeObjectURL(perProfilePreview.value);
      perProfile.value = null;
      perProfilePreview.value = null;
      additionalImagesPreviews.value.forEach((preview) => URL.revokeObjectURL(preview));
      additionalImages.value = [];
      additionalImagesPreviews.value = [];
      validated.value = false;
    };

    const closeModal = () => {
      resetForm();
      emit("closeModal");
    };

    onUnmounted(() => {
      if (perProfilePreview.value) URL.revokeObjectURL(perProfilePreview.value);
      additionalImagesPreviews.value.forEach((preview) => URL.revokeObjectURL(preview));
    });

    return {
      perName,
      perDes,
      perProfile,
      perProfilePreview,
      additionalImages,
      additionalImagesPreviews,
      validated,
      toasts,
      dragOver,
      isLoading,
      isPerNameInvalid,
      perNameErrorMessage,
      isPerDesInvalid,
      perDesErrorMessage,
      isPerProfileInvalid,
      perProfileErrorMessage,
      onDragOver,
      onDragLeave,
      onDrop,
      onFileChange,
      removeFile,
      handleSubmit,
      closeModal,
      userId,
    };
  },
};
</script>

<style scoped>
.is-invalid {
  border-color: #dc3545;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
}

.upload-area.drag-over {
  border-color: #007bff;
  background-color: #e6f0ff;
}

.upload-label {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #666;
}

.upload-label i {
  font-size: 24px;
  color: #007bff;
}

.upload-label span {
  font-size: 16px;
}

.preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.preview-item button {
  position: absolute;
  top: -10px;
  right: -10px;
  border-radius: 50%;
  padding: 2px 6px;
}
</style>
