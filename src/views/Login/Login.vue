<template>
  <div class="wrapper min-vh-100 d-flex flex-row align-items-center bg-light">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol :md="6">
          <CCardGroup>
            <CCard class="p-4 shadow-lg rounded">
              <CCardBody>
                <div class="text-center mb-4">
                  <div>
                    <img src="../../assets/brand/logoProduction.png" width="100px" />

                  </div>
                  <h1 class="display-4" style="font-weight: 400">Login</h1>
                  <p class="text-muted">Sign in with Discord (Admin Role Required)</p>
                </div>

                <CRow>
                  <CCol :xs="12">
                    <CButton
                      color="primary"
                      class="btn-lg btnlogin"
                      @click="loginWithDiscord"
                      :disabled="isLoading"
                    >
                      <span v-if="isLoading"> <CSpinner size="sm" /> Loading... </span>
                      <span v-else>
                        <CIcon icon="cib-discord" />
                        <i class="fa-brands fa-discord"></i>
                        Login with Discord
                      </span>
                    </CButton>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCardGroup>
        </CCol>
      </CRow>
    </CContainer>

    <CToaster class="p-3" placement="top-end">
      <CToast v-for="(toast, index) in toasts" :key="index" visible>
        <CToastHeader closeButton class="bg-primary text-white">
          <span class="me-auto fw-bold">{{ toast.title }}</span>
        </CToastHeader>
        <CToastBody>{{ toast.content }}</CToastBody>
      </CToast>
    </CToaster>
  </div>
</template>

<script>
export default {
  name: "LoginFormComponent",
  data() {
    return {
      isLoading: false,
      toasts: [],
    };
  },
  methods: {
    createToast(st, er) {
      this.toasts.push({ title: st, content: er });
      setTimeout(() => {
        this.toasts.shift();
      }, 5000);
    },
    async loginWithDiscord() {
      this.isLoading = true;
      const apiUrl = process.env.VUE_APP_API_URL || "http://localhost:3030";
      try {
        const discordAuthUrl = `${apiUrl}/api/auth/discord`;
        window.location.href = discordAuthUrl; // ยังคงใช้ redirect สำหรับ OAuth
      } catch (error) {
        this.createToast("Error", "Failed to initiate Discord login");
        this.isLoading = false;
      }
    },
  },
  beforeRouteEnter(to, from, next) {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const error = urlParams.get("error");

    console.log("Route Enter - Params:", { token, error }); // ตรวจสอบพารามิเตอร์

    if (token) {
      localStorage.setItem("token", token);
      next((vm) => {
        vm.$router
          .push("/queue")
          .then(() => {
            console.log("Redirect to /dashboard successful");
          })
          .catch((err) => {
            console.error("Router error:", err);
            vm.createToast("Error", "Failed to navigate to dashboard");
          });
      });
    } else if (error) {
      next((vm) => {
        vm.createToast(
          "Login Failed",
          error === "no_admin_role"
            ? "คุณต้องมีบทบาท manage-admin ในเซิร์ฟเวอร์ Discord เพื่อล็อกอิน"
            : error === "no_guild"
            ? "คุณไม่ได้อยู่ในเซิร์ฟเวอร์ที่ระบุ"
            : error === "unknown_guild"
            ? "บอทไม่ได้อยู่ในเซิร์ฟเวอร์ที่ระบุ กรุณาเชิญบอทและลองใหม่"
            : error === "unauthorized_bot"
            ? "บอทไม่มีสิทธิ์เข้าถึงข้อมูล กรุณาตรวจสอบโทเค็นและสิทธิ์"
            : "การยืนยันตัวตนกับ Discord ล้มเหลว กรุณาลองอีกครั้ง"
        );
        vm.isLoading = false;
      });
    } else {
      next();
    }
  },
};
</script>

<style scoped>
.wrapper {
  background-size: cover;
  background-position: center;
}
h1 {
  color: #e69e09;
}
.btnlogin {
  width: 100%;
  background-color: #e69e09;
  border-color: #e69e09;
}
.btnlogin:hover {
  background-color: #e69e09;
  border-color: #e69e09;
}
.shadow-lg {
  border-radius: 10px;
}
</style>
