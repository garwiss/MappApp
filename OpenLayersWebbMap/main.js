const url = "https://localhost:7196/api/Door";
// const url = " http://localhost:5025/api/Door";

let randomId;
function showNotification(message) {
  Toastify({
    text: message,
    duration: 3000,
    close: true,
  }).showToast();
}
function refreshP() {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const table = $("#example").DataTable();
      table.clear().rows.add(data).draw();
    })
    .catch((error) => {
      console.error("Veriler alınırken hata oluştu: ", error);
    });
}

function addInteractions() {
  draw = new ol.interaction.Draw({
    source: source,
    type: "Point",
  });
  map.addInteraction(draw);
  snap = new ol.interaction.Snap({ source: source });
  map.addInteraction(snap);

  //hata

  draw.on("drawend", function (event) {
    lastDrawnFeature = event.feature;
    const coordinates = event.feature.getGeometry().getCoordinates();
    map.removeInteraction(draw); 
    openAddPanel(coordinates);
  });
}

function openAddPanel(coordinates) {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const existingId = data.map((item) => item.id);

      while (true) {

        randomId = Math.floor(Math.random() * 100) + 1;

        if (!existingId.includes(randomId)) {
          break;
        }
      }


      //Modal pencereyi oluştur
      var addpanel = jsPanel.create({
        position: "center",
        contentSize: "auto auto",
        headerTitle: "Add Panel",
        theme: "dark",

        content:
          `<div class="jsPanel2">
            <div class="input-group">
                <div>
                    <label for="id">ID:</label>
                    <input type="text" id="id" value='${randomId}' readonly>
                </div>
                <div>
                    <label for="name">Name:</label>
                    <input type="text" id="name">
                </div>
                <div>
                    <label for="coorx">X:</label>
                    <input type="text" id="coorx" value='${coordinates[0]}' readonly>
                </div>
                <div>
                    <label for="coory">Y:</label>
                    <input type="text" id="coory" value='${coordinates[1]}' readonly>
                </div>
            </div>
            <div class="button-group">
                <button id="saveButton">Save</button>
                <button id="closeButton">Close</button>
            </div>
          </div>`
        ,

        onclosed: function (addpanel, closedPanel) {
          if (closedPanel == true) {
            source.removeFeature(lastDrawnFeature);
            $("#addpointButton").prop("disabled", false);
            enablequeryPanel();
          }
        },

        callback: function (panel) {
          document
            .getElementById("closeButton")
            .addEventListener("click", function () {
              source.removeFeature(lastDrawnFeature);
              map.removeInteraction(draw);
              panel.close();
              enablequeryPanel();
              $("#addpointButton").prop("disabled", false);
            });

          // Save düğmesine tıklanınca işlemleri yap
          document
            .getElementById("saveButton")
            .addEventListener("click", function () {

              // name kısmının zorunlu alan olması için
              const nameValue = document.getElementById("name").value;
              if (!nameValue) {
                Toastify({
                  text: "Name field cannot be blank", // İsim alanı boş olamaz
                  duration: 3000,
                  close: true,
                }).showToast();
                return;
              }
              const nameRegex = /^[a-z A-ZzÇçĞğİıÖöŞşÜü " "]+$/;
              if (!nameRegex.test(nameValue)) {
                Toastify({
                  text: "Invalid name ",
                  duration: 3000,
                  close: true,
                }).showToast();
                return;
              }

              //Veri
              const id = document.getElementById("id").value;
              const name = document.getElementById("name").value;
              var coorx = document.getElementById("coorx").value;
              var coory = document.getElementById("coory").value;

              //nesne
              const data = {
                id: id,
                name: name,
                x: coorx,
                y: coory,
              };

              fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
              })
                .then((response) => {
                  if (response) {
                    showNotification("Completed");
                    getAll();
                  } else {
                    
                    showNotification("not Completed");
                  }
                })
                .catch((error) => {
                  console.error("Hata:", error);
                });

              map.removeInteraction(draw);

              // location.reload();
              panel.close();
              enablequeryPanel();
              $("#addpointButton").prop("disabled", false);
            });
        },
      });
    });
}
function disablequerypanel() {
  document.getElementById("querypointButton").disabled = true;
}
function enablequeryPanel() {
  document.getElementById("querypointButton").disabled = false;
}

function getAll() {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      vector.getSource().clear();

      // Verileri haritada işaretleme
      data.forEach(function (point) {
        marker = new ol.Feature({
          geometry: new ol.geom.Point([point.x, point.y]),
          id: point.id,
        });

        var iconStyle = new ol.style.Style({
          image: new ol.style.Icon({
            src: "images/location.png", 
            scale: 0.4, 
          }),
        });

        marker.setStyle(iconStyle);

        source.addFeature(marker);
      });
    })
    .catch((error) => {
      console.error("Veriler alınmadı: ", error);
    });
}

function getMarkerFetch() {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // Verileri haritada işaretleme
      data.forEach(function (point) {
        marker = new ol.Feature({
          geometry: new ol.geom.Point([point.x, point.y]),
          id: point.id,
        });

        var iconStyle = new ol.style.Style({
          image: new ol.style.Icon({
            src: "images/location.png",
            scale: 0.4,
          }),
        });

        marker.setStyle(iconStyle);

        source.addFeature(marker);
      });
    })
    .catch((error) => {
      console.error("Veriler alınmadı: ", error);
    });
}

const source = new ol.source.Vector();
const vector = new ol.layer.Vector({
  source: source,
  style: new ol.style.Style({
    image: new ol.style.Icon({
      src: "images/location.png",
      scale: 0.4,
    }),
  }),
});

const raster = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

const extent = ol.proj.get("EPSG:3857").getExtent().slice();
extent[0] += extent[0];
extent[2] += extent[2];
const map = new ol.Map({
  layers: [raster, vector],
  target: "map",
  view: new ol.View({
    center: ol.proj.fromLonLat([32.8597, 39.9334]), // Türkiye'nin merkezi
    zoom: 6.4,
    extent,
  }),
});

let draw, snap;
let lastDrawnFeature;
let deletePointPanel;

//fetch marker
getMarkerFetch();

document
  .getElementById("addpointButton")
  .addEventListener("click", function () {
    addInteractions();
    disablequerypanel();
    addpointButton.disabled = true;
  });

document
  .getElementById("querypointButton")
  .addEventListener("click", function () {
    $("#addpointButton").prop("disabled", true);
    disablequerypanel();

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        openQueryButtonPanel(data);
      })
      .catch((error) => {
        console.error("Veriler alınmadı: ", error);
      });
  });

var queryPanel;
function openQueryButtonPanel(data) {
  queryPanel = jsPanel.create({
    contentOverflow: 'auto',
    position: "center",
    contentSize: "700 500",
    headerTitle: "Data Panel",
    theme: "dark",
    content: `
         <div class="p-2" >
            <table id="example" class="table table-striped" style="width:100%">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>X</th>
                        <th>Y</th>
                        <th>Actions</th> 
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>            
          </div> `,
    //!panel icon closed
    onclosed: function (jspanel, closedPanel) {
      if (closedPanel == true) {
        $("#addpointButton").prop("disabled", false);
        enablequeryPanel();
      }
      
    },

    callback: function (panel) {

      $("#example").DataTable({
        data: data, 
        columns: [
          { data: "id" },
          { data: "name" },
          { data: "x" },
          { data: "y" },
          {
            data: null,
            render: function (data, type, row) {
              return (
                //datatable paneline aşağıdaki gibi verileri açılan panelde ekledik
                '<div class="edit-delete-button-group"><button class="edit-button" data-id="' +
                row["id"] +
                '" data-name="' +
                row["name"] +
                '" data-x="' +
                row["x"] +
                '" data-y="' +
                row["y"] +
                '"><i class="fa-solid fa-pen-to-square"></i></button>' +
                '<button class="delete-button" data-id="' +
                row["id"] +
                '"><i class="fa-solid fa-trash"></i></button></div>'
              );
            },
          },
        ],
      });

      // var id = data.ID; // Veriler içindeki ID değerine erişim
      $("#example").on("click", ".edit-button", function () {
        var button = $(this);
        disablequerypanel();
        $("#addpointButton").prop("disabled", true);
        var id = button.data("id");
        var name = button.data("name");
        var x = button.data("x");
        var y = button.data("y");

        const data = {
          id: id,
          name: name,
          x: x,
          y: y,
        };

        openEditPanel(data);
        disablequerypanel();
        $("#addpointButton").prop("disabled", true);
      });
      $("#example").on("click", ".delete-button", function () {
        $("#addpointButton").prop("disabled", true);
        var id = $(this).data("id");

        //!
        queryPanel.close();

        deletePointPanel = jsPanel.create({
          contentSize: "auto auto",
          theme: "dark",
          content: `
            <div class="popUpDelete">
              <p>${id} numaralı yeri silmek istediğinize emin misiniz? </p>
            
              <div class="sureButton">
                <button id="confirmDelete">Evet</button>
                <button id="cancelDelete">İptal</button>
              </div>
            </div>
          `,
          headerTitle: "Are you sure?",

          onclosed: function (jspanel, closedPanel) {
            if (closedPanel == true) {
              $("#addpointButton").prop("disabled", false);
              enablequeryPanel();
            }
          },
        });
        $("#confirmDelete").on("click", function () {
          // enablequeryPanel();
          // $("#addpointButton").prop("disabled", false);
          openQueryButtonPanel();
        });
        $("#cancelDelete").on("click", function () {
          openQueryButtonPanel();
          refreshP();
        });

        $("#confirmDelete").on("click", function () {
          fetch(url + "/" + id, {
            method: "DELETE",
          })
            .then((response) => {
              if (response.status === 200) {
                var features = vector.getSource().getFeatures();

                features.forEach(function (item) {
                  // features delete map
                  var featureId = item.get("id");
                  if (featureId === id) {
                    vector.getSource().removeFeature(item);
                    showNotification("Deleted");
                  }
                  refreshP();
                  getAll();
                });
              } else {
                console.error("Silme sırasında hata oluştu", response.status);
                showNotification("Silinmede hata");
              }
              refreshP();
            })
            .catch((error) => {
              console.error("Hata:", error);
            });
          deletePointPanel.close();
        });
        $("#cancelDelete").on("click", function () {
          deletePointPanel.close();
        });
      });
    },
  });
}

function openEditPanel(data) {
  queryPanel.close();
  var editPanel = jsPanel.create({
    contentSize: "auto auto",
    headerTitle: "Edit panel",
    theme: "dark",
    position: "center",
    content:
      '<div class="jspanel-edit">' +
      '<label for="name">Name:</label>' +
      '<input type="text"  id="editname" value="' +
      data.name +
      '"><br>' +
      '<label for="x">Coordinate X</label>' +
      '<input type="text" id="x-coor" value="' +
      data.x +
      '"readonly><br>' +
      '<label for="y">Coordinate Y</label>' +
      '<input type="text"  id="y-coor" value="' +
      data.y +
      '"readonly><br>' +
      '<div class="edit-panel-buttons"><button class="saveBtn">Save</button>' +
      '<button class="closeBtn">Close</button>' +
      '<button id="editOnMap">EditOnMap</button>' +
      "</div></div>",

    //!panel icon closed
    onclosed: function (jspanel, closedPanel) {
      if (closedPanel == true) {
        $("#addpointButton").prop("disabled", false);
        enablequeryPanel();
        refreshP();
        getAll();
      }
    },

    callback: function () {
      $(this).on("click", ".saveBtn", function () {
        var updatename = $("#editname").val();
        var updateX = $("#x-coor").val();
        var updateY = $("#y-coor").val();

        const dataUpdate = {
          id: data.id,
          name: updatename,
          x: updateX,
          y: updateY,
        };
        // name kısmının zorunlu alan olması için
        const nameValueEdit = document.getElementById("editname").value;

        if (!nameValueEdit) {
          Toastify({
            text: "Name field cannot be empty", // İsim alanı boş olamaz
            duration: 3000,
            close: true,
          }).showToast();
          return;
        }
        const nameRegex = /^[a-zA-Z-zÇçĞğİıÖöŞşÜü " " ]+$/;
        if (!nameRegex.test(nameValueEdit)) {
          Toastify({
            text: "Invalid name ",
            duration: 3000,
            close: true,
          }).showToast();
          return;
        }
        enablequeryPanel();
        $("#addpointButton").prop("disabled", false);

        fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataUpdate),
        })
          .then((response) => {
            if (response.status === 200) {
              showNotification("Veri güncellendi");
            } else {
              showNotification("Veri güncellenirken hata oluştu");
            }
            editPanel.close();
          })
          .catch((error) => {
            console.error("Error updating data:", error);
          });
      });

      var features = vector.getSource().getFeatures();

      $("#editOnMap").on("click", function () {
        // console.log(source);
        // console.log(modify);
        disablequerypanel();
        $("#addpointButton").prop("disabled", true);
        const modify = new ol.interaction.Modify({ source: source });
        map.addInteraction(modify);

        queryPanel.close();
        editPanel.close();

        // Yalnızca seçilen feature'ı koru
        features.forEach(function (item) {
          var featureId = item.get("id");
          if (featureId !== data.id) {
            vector.getSource().removeFeature(item);
          }
        });

        const view = map.getView();
        view.animate({
          center: [data.x, data.y],
          zoom: 17,
          duration: 1000,
        });

        modify.on("modifyend", function (event) {
          map.removeInteraction(modify);

          const feature = event.features.getArray()[0];
          if (feature && feature.getGeometry().getType() === "Point") {
            const [x, y] = feature.getGeometry().getCoordinates();
            console.log(x, y);
            data.x = x;
            data.y = y;

            // console.log(features);
            features.forEach(function (item) {
              var featureId = item.get("id");
              if (featureId !== data.id && typeof featureId !== undefined) {
                vector.getSource().addFeature(item);
              }
            });

            openEditPanel(data);

            modify.setActive(false);
          }
        });
      });
      $(this).on("click", ".closeBtn", function () {
        editPanel.close();
        openQueryButtonPanel();
        refreshP();
        getAll();
      });
    },
  });
}
