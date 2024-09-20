


document.addEventListener('DOMContentLoaded', function () {
    fetchOrderDetail();
});

function fetchOrderDetail() {
    const xhttp_detail = new XMLHttpRequest();
    xhttp_detail.onload = function () {
    if (this.status === 200) {
    const detail = JSON.parse(this.responseText);
    console.log('Anasayfa detay:', detail);

    // İlk set için güncellemeler
    const counterValueElement = document.getElementById("counter-value");
    const totalPrice = parseInt(detail.current_total_price, 10);
    counterValueElement.innerHTML = totalPrice;
    counterValueElement.setAttribute('data-target', totalPrice);

    const changePercentage = parseFloat(detail.change_percentage).toFixed(2);
    const changePercentageElement = document.getElementById("change_percentage");
    const arrowIcon = document.getElementById("arrow-icon");
    const oran1 = document.getElementById("oran-1");

// -----------TOPLAM KAZANC--------------
    if (changePercentage > 0) {
        arrowIcon.className = 'ri-arrow-right-up-line'; // Pozitif için yukarı ok
        changePercentageElement.classList.add('text-success', 'bg-success-subtle'); // Pozitif için yeşil ve arka plan
        changePercentageElement.classList.remove('text-danger', 'bg-danger-subtle'); // Negatif için kırmızı ve arka plan (önceki sınıfları kaldır)
    } else if (changePercentage < 0) {
        arrowIcon.className = 'ri-arrow-right-down-line'; // Negatif için aşağı ok
        changePercentageElement.classList.add('text-danger', 'bg-danger-subtle'); // Negatif için kırmızı ve arka plan
        changePercentageElement.classList.remove('text-success', 'bg-success-subtle'); // Pozitif için yeşil ve arka plan (önceki sınıfları kaldır)
    } else {
        arrowIcon.className = ''; // Oran sıfırsa ok simgesini kaldırabilir veya ayarlayabilirsiniz
        changePercentageElement.classList.remove('text-success', 'text-danger', 'bg-success-subtle', 'bg-danger-subtle'); // Her iki sınıfı da kaldır
        oran1.innerHTML = 'Geçen haftaya oranla sabit';
        changePercentageElement.classList.add('d-none'); // Negatif için kırmızı ve arka plan

    }
    changePercentageElement.innerHTML = `${arrowIcon.outerHTML} ${changePercentage}%`;

// -----------TOPLAM SIPARIS--------------
    const counterValueElement2 = document.getElementById("counter-value-2");
    const totalPrice2 = parseInt(detail.current_total_orders_count, 10);
    counterValueElement2.innerHTML = totalPrice2 + " Adet";
    counterValueElement2.setAttribute('data-target', totalPrice2);

    const changePercentage2 = parseFloat(detail.change_order_percentage).toFixed(2);
    const changePercentageElement2 = document.getElementById("change_percentage-2");
    const arrowIcon2 = document.getElementById("arrow-icon-2");
    const oran2 = document.getElementById("oran-2");


    if (changePercentage2 > 0) {
        arrowIcon2.className = 'ri-arrow-right-up-line'; // Pozitif için yukarı ok
        changePercentageElement2.classList.add('text-success', 'bg-success-subtle'); // Pozitif için yeşil ve arka plan
        changePercentageElement2.classList.remove('text-danger', 'bg-danger-subtle'); // Negatif için kırmızı ve arka plan (önceki sınıfları kaldır)
    } else if (changePercentage2 < 0) {
        arrowIcon2.className = 'ri-arrow-right-down-line'; // Negatif için aşağı ok
        changePercentageElement2.classList.add('text-danger', 'bg-danger-subtle'); // Negatif için kırmızı ve arka plan
        changePercentageElement2.classList.remove('text-success', 'bg-success-subtle'); // Pozitif için yeşil ve arka plan (önceki sınıfları kaldır)
    } else {
        arrowIcon2.className = ''; // Oran sıfırsa ok simgesini kaldırabilir veya ayarlayabilirsiniz
        changePercentageElement2.classList.remove('text-success', 'text-danger', 'bg-success-subtle', 'bg-danger-subtle'); // Her iki sınıfı da kaldır
        oran2.innerHTML = 'Geçen haftaya oranla sabit';
        changePercentageElement2.classList.add('d-none'); // Negatif için kırmızı ve arka plan

    }
    changePercentageElement2.innerHTML = `${arrowIcon2.outerHTML} ${changePercentage2}%`;
    
    // -----------TOPLAM UYE--------------
    
      const counterValueElement3 = document.getElementById("counter-value-3");
    const totalPrice3 = parseInt(detail.current_total_users, 10);
    counterValueElement3.innerHTML = totalPrice3 + " Kişi";
    counterValueElement3.setAttribute('data-target', totalPrice3);

    const changePercentage3 = parseFloat(detail.change_user_percentage).toFixed(2);
    const changePercentageElement3 = document.getElementById("change_percentage-3");
    const arrowIcon3 = document.getElementById("arrow-icon-3");
    const oran3 = document.getElementById("oran-3");


    if (changePercentage3 > 0) {
        arrowIcon3.className = 'ri-arrow-right-up-line'; // Pozitif için yukarı ok
        changePercentageElement3.classList.add('text-success', 'bg-success-subtle'); // Pozitif için yeşil ve arka plan
        changePercentageElement3.classList.remove('text-danger', 'bg-danger-subtle'); // Negatif için kırmızı ve arka plan (önceki sınıfları kaldır)
    } else if (changePercentage3 < 0) {
        arrowIcon3.className = 'ri-arrow-right-down-line'; // Negatif için aşağı ok
        changePercentageElement3.classList.add('text-danger', 'bg-danger-subtle'); // Negatif için kırmızı ve arka plan
        changePercentageElement3.classList.remove('text-success', 'bg-success-subtle'); // Pozitif için yeşil ve arka plan (önceki sınıfları kaldır)
    } else {
        arrowIcon3.className = ''; // Oran sıfırsa ok simgesini kaldırabilir veya ayarlayabilirsiniz
        changePercentageElement3.classList.remove('text-success', 'text-danger', 'bg-success-subtle', 'bg-danger-subtle'); // Her iki sınıfı da kaldır
        oran3.innerHTML = 'Geçen haftaya oranla sabit';
        changePercentageElement3.classList.add('d-none'); // Negatif için kırmızı ve arka plan

    }
    changePercentageElement3.innerHTML = `${arrowIcon3.outerHTML} ${changePercentage3}%`;
    
    // -----------TOPLAM ÜRÜN--------------
    
      const counterValueElement4 = document.getElementById("counter-value-4");
    const totalPrice4 = parseInt(detail.current_total_products, 10);
    counterValueElement4.innerHTML = totalPrice4 + " Tane";
    counterValueElement4.setAttribute('data-target', totalPrice4);

    const changePercentage4 = parseFloat(detail.change_product_percentage).toFixed(2);
    const changePercentageElement4 = document.getElementById("change_percentage-4");
    const arrowIcon4 = document.getElementById("arrow-icon-4");
    const oran4 = document.getElementById("oran-4");


    if (changePercentage4 > 0) {
        arrowIcon4.className = 'ri-arrow-right-up-line'; // Pozitif için yukarı ok
        changePercentageElement4.classList.add('text-success', 'bg-success-subtle'); // Pozitif için yeşil ve arka plan
        changePercentageElement4.classList.remove('text-danger', 'bg-danger-subtle'); // Negatif için kırmızı ve arka plan (önceki sınıfları kaldır)
    } else if (changePercentage4 < 0) {
        arrowIcon4.className = 'ri-arrow-right-down-line'; // Negatif için aşağı ok
        changePercentageElement4.classList.add('text-danger', 'bg-danger-subtle'); // Negatif için kırmızı ve arka plan
        changePercentageElement4.classList.remove('text-success', 'bg-success-subtle'); // Pozitif için yeşil ve arka plan (önceki sınıfları kaldır)
    } else {
        arrowIcon4.className = ''; // Oran sıfırsa ok simgesini kaldırabilir veya ayarlayabilirsiniz
        changePercentageElement4.classList.remove('text-success', 'text-danger', 'bg-success-subtle', 'bg-danger-subtle'); // Her iki sınıfı da kaldır
        oran4.innerHTML = 'Geçen haftaya oranla sabit';
        changePercentageElement4.classList.add('d-none'); // Negatif için kırmızı ve arka plan

    }
    changePercentageElement4.innerHTML = `${arrowIcon4.outerHTML} ${changePercentage4}%`;
    
} else {
    console.error('Anasayfa detayi getirilemedi:', this.status);
}
    };
    xhttp_detail.onerror = function () {
        console.error('襤stek hatas覺');
    };
    xhttp_detail.open("GET", `/Yonetici/api/dashboard.php`);
    xhttp_detail.send();
}

var options = {
    valueNames: [
        "id",
        "customer_name",
        "product_name",
        "amount",
        "order_date",
        "delivery_date",
        "payment_method",
        "status",
    ],

};

var orderList = new List("orderList", options).on("updated", function (list) {
});
const xhttp = new XMLHttpRequest();
xhttp.onload = function () {
    if (this.status === 200) {
        const json_records = JSON.parse(this.responseText);
        console.log(json_records);

        // Son 10 kaydı al
        const limitedOrders = json_records.orders.slice(-10);

        // Process orders
        limitedOrders.forEach(function (element) {
            const orderId = element.id;
            orderList.add({
                id: '<a href="/Yonetici/invoices-details.php?id=' + orderId + '" class="fw-medium link-primary">#' + orderId + '</a>',
                customer_name: element.name,
                product_name: element.phone,
                amount: element.create_time,
                order_date: element.city,
                delivery_date: element.email,
                payment_method: element.totalPrice,
                status: element.status
            });
        });

        // ID'ye göre ters sırada sıralama yap
        orderList.sort('id', { order: "desc" });

    } else {
        console.error('Error fetching data:', this.statusText);
    }
};



xhttp.open("GET", "/Yonetici/api/orders.php");
xhttp.send();
