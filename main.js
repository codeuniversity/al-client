const socket = new WebSocket("ws://localhost:4000");

socket.addEventListener("open", function (event) {
    console.log("Socket established");

    const filterDefinitions = [{
        left_hand: "cell.pos.x",
        left_hand_type: "coordinate",
        operator: "<",
        right_hand: "2000",
        right_hand_type: "number"
    }, {
        left_hand: "cell.pos.y",
        left_hand_type: "coordinate",
        operator: "<",
        right_hand: "2000",
        right_hand_type: "number"
    }, {
        left_hand: "cell.pos.z",
        left_hand_type: "coordinate",
        operator: "<",
        right_hand: "2000",
        right_hand_type: "number"
    }, {
        left_hand: "cell.pos.x",
        left_hand_type: "coordinate",
        operator: ">",
        right_hand: "0",
        right_hand_type: "number"
    }, {
        left_hand: "cell.pos.y",
        left_hand_type: "coordinate",
        operator: ">",
        right_hand: "0",
        right_hand_type: "number"
    }, {
        left_hand: "cell.pos.z",
        left_hand_type: "coordinate",
        operator: ">",
        right_hand: "0",
        right_hand_type: "number"
    }];

    socket.send(JSON.stringify(filterDefinitions));
});


const dimensions = 400;
const population = 10000;


let camera, scene, group, renderer;
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
    const geometry = new THREE.IcosahedronBufferGeometry(1);
    const material = new THREE.MeshNormalMaterial();
    group = new THREE.Group();

    // create cube grid
    const gridGeometry = new THREE.BoxBufferGeometry(dimensions, dimensions, dimensions);
    const gridEdges = new THREE.EdgesGeometry(gridGeometry);
    const grid = new THREE.LineSegments(gridEdges, new THREE.LineBasicMaterial({
        color: 0x00ffff
    }));

    scene.add(grid);

    // add random nodes
    for (let counter = 0; counter < population; counter++) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = Math.random() * dimensions - dimensions / 2;
        mesh.position.y = Math.random() * dimensions - dimensions / 2;
        mesh.position.z = Math.random() * dimensions - dimensions / 2;
        mesh.rotation.x = Math.random() * 2 * Math.PI;
        mesh.rotation.y = Math.random() * 2 * Math.PI;
        mesh.visible = false;
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

    let lastLength = 0;

    // listen for socket messages and updating scene
    socket.addEventListener("message", function (event) {
        const message = JSON.parse(event.data);
        const nodes = message.cells || [];

        if (message.warnings) console.warn(message.warnings);

        for (let counter = 0; counter < nodes.length; counter++) {
            const node = nodes[counter];

            if (node.id && node.pos.x && node.pos.y && node.pos.z) {
                node.pos.x = node.pos.x / 5 - dimensions / 2;
                node.pos.y = node.pos.y / 5 - dimensions / 2;
                node.pos.z = node.pos.z / 5 - dimensions / 2;
                group.children[counter].position.set(node.pos.x, node.pos.y, node.pos.z);
                group.children[counter].visible = true;
            }
        }

        for (let counter = nodes.length; counter < lastLength; counter++) {
            group.children[counter].visible = false;
        }

        lastLength = nodes.length;
    });

    document.onmousemove = function (event) {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    };

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

    //scene.rotation.x = Math.sin(time * 0.7) * 0.5;
    //scene.rotation.y = Math.sin(time * 0.3) * 0.5;
    //scene.rotation.z = Math.sin(time * 0.2) * 0.5;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
};

create();
render();
