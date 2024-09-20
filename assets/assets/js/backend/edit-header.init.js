     document.addEventListener('DOMContentLoaded', function() {
            fetchMenuDetail();
        });

        function fetchMenuDetail() {
                        const idInput = document.getElementById('page-id-input').value;

            const xhttp_detail = new XMLHttpRequest();
            xhttp_detail.onload = function () {
                if (this.status === 200) {
                    const detail = JSON.parse(this.responseText);
                    console.log('Detay:', detail);
                    document.getElementById('page-title-input').value = detail.title;
                    document.getElementById('page-content-input').value = detail.content;

                } else {
                    console.error('Menü detayı getirilemedi:', this.status);
                }
            };
            xhttp_detail.onerror = function () {
                console.error('İstek hatası');
            };
            xhttp_detail.open("GET", `/Yonetici/api/headers.php?id=${idInput}`);
            xhttp_detail.send();
        }

        var forms = document.querySelectorAll('.needs-validation');

        Array.prototype.slice.call(forms).forEach(function (form) {
                                            const idInput = document.getElementById('page-id-input').value;

            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                } else {
                    event.preventDefault();

                    // Form verilerini al
                    const formData = {
                        page_title: document.getElementById('page-title-input').value,
                        content: document.getElementById('page-content-input').value,
                    };

                    const xhttp_createPage = new XMLHttpRequest();
                    xhttp_createPage.onload = function () {
                        if (this.status === 201) {
                            alert('Sayfa Oluşturuldu!');

                            setTimeout(function() {
                                window.location.href = "/Yonetici/headers.php";
                            }, 2000); // 2 saniye sonra yönlendir
                        } else {
                            alert('Sayfa oluşturulamadı');
                        }
                    };
                    xhttp_createPage.onerror = function () {
                        alert('Hata');
                    };

                    xhttp_createPage.open("POST", "/Yonetici/api/headers.php?id="+idInput);
                    xhttp_createPage.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    xhttp_createPage.send(JSON.stringify(formData));
                }

                form.classList.add('was-validated');

            }, false);
        });