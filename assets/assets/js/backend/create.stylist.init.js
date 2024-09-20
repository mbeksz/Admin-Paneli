var forms = document.querySelectorAll('.needs-validation');

Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();

            // Form verilerini al
            const formData = {
                page_title: document.getElementById('page-title-input').value,
                content: document.getElementById('page-content-input').value, // Get content from textarea
            };

            const xhttp_createPage = new XMLHttpRequest();
            xhttp_createPage.onload = function () {
                if (this.status === 201) {
                    alert('Sayfa Oluşturuldu!');

                    // Opsiyonel: Başka bir sayfaya yönlendirme
                    setTimeout(function () {
                        window.location.href = "/Yonetici/stylist.php";
                    }, 2000); // 2 saniye sonra yönlendir
                } else {
                    alert('Sayfa oluşturulamadı');
                }
            };
            xhttp_createPage.onerror = function () {
                alert('Hata oluştu');
            };
            xhttp_createPage.open("POST", "/Yonetici/api/stylist.php");
            xhttp_createPage.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhttp_createPage.send(JSON.stringify(formData));
        }

        form.classList.add('was-validated');

    }, false);
});


