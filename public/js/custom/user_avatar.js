$(document).ready(function () {
    loadMedia();

    // رفع صورة واحدة
    $("#uploadBtn").click(function () {
        $("#imageInput").click();
    });

    $("#imageInput").change(function () {
        $("#uploadForm").submit();
    });

    // تنفيذ الرفع
    $("#uploadForm").submit(function (e) {
        e.preventDefault();
        const formData = new FormData(this);

        $.ajax({
            url: urlUpload,
            method: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function () {
                $("#imageInput").val("");
                loadMedia();
            },
            error: function (xhr) {
                console.error(xhr.responseJSON || xhr.responseText);
                alert("حدث خطأ أثناء الرفع.");
            },
        });
    });

    // تحميل الصور
    function loadMedia() {
        $.get(urlIndex, function (data) {
            let html = "";
            data.forEach((item) => {
                html += `
                    <div class="overflow-hidden masonry-item position-relative">
                        <img src="/storage/${item.image_url}" class="img-fluid media-image">
                        <div class="top-0 p-2 media-actions position-absolute" style="display: none;">
                            <button class="border btn btn-sm btn-light rounded-circle edit-btn" data-id="${item.id}" title="تعديل" data-name="${item.name}" data-category="${item.category}" data-is_default="${item.is_default}" data-is_active="${item.is_active}" data-sort_order="${item.sort_order}">
                                <i class="fas fa-eye text-secondary"></i>
                            </button>
                            <button class="border btn btn-sm btn-light rounded-circle me-1 delete-btn" data-id="${item.id}" title="حذف">
                                <i class="fas fa-trash text-danger"></i>
                            </button>
                        </div>
                        <div class="p-2 text-center info">
                            <small>${item.name}</small>
                        </div>
                    </div>
                `;
            });
            $("#mediaGrid").html(html);
        });
    }

    let deleteId = null;
    $(document).on("click", ".delete-btn", function () {
        deleteId = $(this).data("id");
        $("#openDeleteModalBtn").click();
    });

    $("#confirmDeleteBtn").click(function () {
        if (deleteId) {
            $.ajax({
                url: urlDelete.replace(":id", deleteId),
                method: "DELETE",
                data: { _token: _token },
                success: function () {
                    $("#closeDeleteModal").click();
                    loadMedia();
                },
            });
        }
    });

    // فتح مودال التعديل
    $(document).on("click", ".edit-btn", function () {
        const id = $(this).data("id");

        $.get(urlEdit.replace(":id", id), function (data) {
            $("#editId").val(data.id);
            $("#editCategory").val(data.category);
            $("#editIsDefault").val(data.is_default);
            $("#editIsActive").val(data.is_active);
            $("#editSortOrder").val(data.sort_order);

            $("#infoName").text(data.name);
            $("#infoMime").text(data.mime_type || "image/png");
            $("#infoSize").text((data.size / 1024).toFixed(2));
            $("#infoURL").val("/storage/" + data.image_url);

            $("#editPreview")
                .attr("src", "/storage/" + data.image_url)
                .attr("alt", data.name);

            $("#openEditModalBtn").click();
        });
    });

    // تنفيذ الحفظ بعد التعديل
    $("#editForm").submit(function (e) {
        e.preventDefault();
        const id = $("#editId").val();
        $.ajax({
            url: urlEdit.replace(":id", id),
            method: "PUT",
            data: {
                _token: _token,
                name: $("#editName").val(),
                image_url: $("#editImageUrl").val(),
                category: $("#editCategory").val(),
                is_default: $("#editIsDefault").val(),
                is_active: $("#editIsActive").val(),
                sort_order: $("#editSortOrder").val(),
            },
            success: function () {
                $("#closeEditModal").click();
                loadMedia();
            },
        });
    });
});
