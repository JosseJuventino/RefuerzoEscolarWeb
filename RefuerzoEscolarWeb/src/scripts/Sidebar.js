import styles from "../css/dashboard.module.css";

document.addEventListener("DOMContentLoaded", function () {
  console.log("Document loaded and DOMContentLoaded event fired");

  // Sidebar toggle
  const sidebarToggle = document.getElementById("logo-sidebar-toggle");
  const logoSidebar = document.getElementById("logo-sidebar");

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      if (logoSidebar) {
        logoSidebar.classList.toggle(styles.closed);
        logoSidebar.classList.toggle(styles.open);
      }
    });
  }

  // User menu toggle
  const userMenuToggle = document.getElementById("user-menu-toggle");
  const userDropdown = document.getElementById("dropdown-user");

  if (userMenuToggle) {
    userMenuToggle.addEventListener("click", function () {
      console.log("User menu toggle button clicked");

      if (userDropdown) {
        userDropdown.classList.toggle(styles.hidden);
        console.log(
          "User dropdown toggled. Current classes:",
          userDropdown.className
        );
      }
    });
  }
});
