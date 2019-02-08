const socket = new WebSocket("ws://localhost:4000");

socket.addEventListener("open", function (event) {
    console.log("Socket established");
});



const limitation = 400;
const population = 200;


var camera, scene, renderer, group, freeze;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

function create() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 10;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.Fog(0xffffff, 1, 10000);
    var geometry = new THREE.IcosahedronBufferGeometry(1);
    var material = new THREE.MeshNormalMaterial();
    group = new THREE.Group();


    const gridGeometry = new THREE.BoxBufferGeometry(limitation, limitation, limitation);
    const gridEdges = new THREE.EdgesGeometry(gridGeometry);
    const grid = new THREE.LineSegments(gridEdges, new THREE.LineBasicMaterial({
        color: 0x00ffff
    }));
    scene.add(grid);

    // init point in the center
    var bigbangShape = new THREE.SphereBufferGeometry(1, 40, 40);
    var bigbangMaterial = new THREE.MeshDepthMaterial();
    const bigbang = new THREE.Mesh(bigbangShape, bigbangMaterial);
    bigbang.position.x = 0;
    bigbang.position.y = 0;
    bigbang.position.z = 0;
    bigbang.matrixAutoUpdate = true;
    scene.add(bigbang);

    // add random nodes
    for (let i = 0; i < population; i++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = Math.random() * limitation - limitation / 2;
        mesh.position.y = Math.random() * limitation - limitation / 2;
        mesh.position.z = Math.random() * limitation - limitation / 2;
        mesh.rotation.x = Math.random() * 2 * Math.PI;
        mesh.rotation.y = Math.random() * 2 * Math.PI;
        mesh.matrixAutoUpdate = true;
        group.add(mesh);
    }

    scene.add(group);

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // listen for socket messages and updating scene
    socket.addEventListener("message", function (event) {
        const nodes = JSON.parse(event.data)
        //console.log(nodes);
        for (let counter = 0; counter < population; counter++) {
            const node = nodes[counter];
            if (!node) {
                console.log("died");
                //scene.remove(group.children[counter]);
                return;
            }

            node.pos.x = node.pos.x / 5 - limitation / 2;
            node.pos.y = node.pos.y / 5 - limitation / 2;
            node.pos.z = node.pos.z / 5 - limitation / 2;
            group.children[counter].position.set(node.pos.x, node.pos.y, node.pos.z);
        }
    });

    document.onmousemove = function (event) {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    };

    document.onmousedown = function (event) {
        freeze = true;
    }

    document.onmouseup = function (event) {
        freeze = false;
    }

    window.onresize = function () {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
}



const render = function (actions) {
    const time = Date.now() * 0.001;

    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    scene.rotation.x = Math.sin(time * 0.7) * 0.5;
    scene.rotation.y = Math.sin(time * 0.3) * 0.5;
    scene.rotation.z = Math.sin(time * 0.2) * 0.5;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
};

create();
render();
