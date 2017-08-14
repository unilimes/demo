"use strict";
var scene;
function setScene( arg ){
    scene = arg;
}

class Viewer {
    constructor (){
        this.objects = [];

        this.allowText = false;
        this.allowWheel = false;

        this.text = "demoProject";
        this.height = 20;
        this.size = 70;
        this.hover = 0;
        this.curveSegments = 4;
        this.bevelThickness = 2;
        this.bevelSize = 1.5;
        this.bevelEnabled = true;
        this.font = undefined;


        this.init();
        this.animate();
        this.onWindowResize();
        this.render();
        this.createText();
    }

    addShadowedLight( x, y, z, color, intensity, shadow ) {

        let directionalLight = new THREE.DirectionalLight( color, intensity );
        directionalLight.position.set( x, y, z );

        this.scene.add( directionalLight );

        directionalLight.castShadow = true;
        if(shadow == false)
            directionalLight.castShadow = false;


        let d = 3;
        directionalLight.shadow.camera.left = -d;
        directionalLight.shadow.camera.right = d;
        directionalLight.shadow.camera.top = d;
        directionalLight.shadow.camera.bottom = -d;

        directionalLight.shadow.camera.near = 0;
        directionalLight.shadow.camera.far = 10;

        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;

        directionalLight.shadow.bias = -0.005;

    };

    init(){
        this.container = document.createElement( 'div' );
        document.body.appendChild( this.container );

        this.camera = new THREE.PerspectiveCamera( 35, window.i2nnerWidth / window.innerHeight, 1, 15 );
        this.camera.position.set( 3, 0.15, 3 );

        this.cameraTarget = new THREE.Vector3( 0, -0.25, 0 );

        this.controls = new THREE.TrackballControls( this.camera );
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;

        this.scene = new THREE.Scene();
        setScene( this.scene );

        this.scene.fog = new THREE.Fog( 0x72645b, 2, 15 );


        // Ground
        let manager = new THREE.LoadingManager();
        let grid = new THREE.Texture();
        grid.magFilter = THREE.LinearFilter;
        grid.minFilter = THREE.LinearFilter;
        grid.wrapS = grid.wrapT = THREE.RepeatWrapping;
        grid.offset.set( 0, 0 );
        grid.repeat.set( 52, 52 );
        let loader = new THREE.ImageLoader( manager );
        grid.image = loader.load( './grid.jpg');
        grid.needsUpdate = true;

        let plane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 40, 40 ),
            new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
        );
        plane.rotation.x = -Math.PI/2;
        plane.position.y = -0.5;

        plane.material.map = grid;
        this.scene.add( plane );

        plane.receiveShadow = true;

        // Plane
        manager = new THREE.LoadingManager();
        let davinchi = new THREE.Texture();
        davinchi.magFilter = THREE.LinearFilter;
        davinchi.minFilter = THREE.LinearFilter;
        loader = new THREE.ImageLoader( manager );
        davinchi.image = loader.load( './vinci.jpg');
        davinchi.needsUpdate = true;


        plane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 1, 1 ),
            new THREE.MeshPhongMaterial( { color: 0xcbcbcb, specular: 0x101010 } )
        );
        plane.rotation.y = 0.94;
        plane.position.y = 0.36;
        plane.receiveShadow = true;
        plane.position.x = -1;
        plane.position.z = -0.9;
        plane.name = 'plane';
        plane.material.side = 2;
        plane.material.map = davinchi;
        this.scene.add( plane );
        this.objects.push(plane);

        plane.castShadow = true;

        // ASCII file

        loader = new THREE.STLLoader();
        loader.load( './obj/slotted_disk.stl',  ( geometry ) => {

            let material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );
            let mesh = new THREE.Mesh( geometry, material );

            mesh.position.set( 0, - 0.25, 0.6 );
            mesh.rotation.set( 0, - Math.PI / 2, 0 );
            mesh.scale.set( 0.5, 0.5, 0.5 );

            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.name = 'wheel';
            this.objects.push(mesh);
            this.scene.add( mesh );
            this.allowWheel = true;

        } );


        // Lights

        this.scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );

        this.addShadowedLight( 1, 1, 1, 0xffffff, 1.35, true );
        this.addShadowedLight( 0.5, 1, -1, 0xffaa00, 1, false );

        // renderer
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setClearColor( this.scene.fog.color );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.renderReverseSided = false;

        this.container.appendChild( this.renderer.domElement );

        let dragControls = new THREE.DragControls( this.objects, this.camera, this.renderer.domElement );
        dragControls.addEventListener( 'dragstart', ( event ) =>{ this.controls.enabled = false; } );
        dragControls.addEventListener( 'dragend',  ( event ) => { this.controls.enabled = true; } );

        this.loadFont();
        window.addEventListener( 'resize', this.onWindowResize.bind(this), false );
        this.onWindowResize();

    }

    animate() {
        if(this.scene.getObjectByName('plane').position.y < 0){
            this.scene.getObjectByName('plane').position.y = 0;
        }


        if(this.allowText){
            if(this.scene.getObjectByName('text').position.y < -0.45){
                this.scene.getObjectByName('text').position.y = -0.45;
            }
        }
        if(this.allowWheel){
            if(this.scene.getObjectByName('wheel').position.y < -0.25){
                this.scene.getObjectByName('wheel').position.y = -0.25;
            }
        }

        this.render();

        requestAnimationFrame( () => {
            this.animate();
        } );
    };

    render() {
        this.controls.update();
        this.camera.lookAt( this.cameraTarget );
        this.renderer.render( this.scene, this.camera );
    };

    onWindowResize() {
        console.log(this, this.camera);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        console.log('s');
    };

    loadFont() {
        let loader = new THREE.FontLoader();
        loader.load( './font.json', ( response ) => {
            this.font = response;
            console.log(this.font);
            this.refreshText();
            setTimeout(()=>{
                this.allowText = true;
            }, 2000);

        } );
    };

    refreshText() {
        this.scene.remove( this.textMesh1 );
        if (! this.text )
            return;
        this.createText();
    };

    createText() {
        this.textGeo = new THREE.TextBufferGeometry( this.text, {
            font: this.font,
            size: this.size,
            height: this.height,
            curveSegments: this.curveSegments,
            bevelThickness: this.bevelThickness,
            bevelSize: this.bevelSize,
            bevelEnabled: this.bevelEnabled,
            material: 0,
            extrudeMaterial: 1
        });
        this.textGeo.computeBoundingBox();
        this.textGeo.computeVertexNormals();
        if ( ! this.bevelEnabled ) {
            let triangleAreaHeuristics = 0.1 * ( this.height * this.size );
            for ( let i = 0; i < this.textGeo.faces.length; i ++ ) {
                let face = this.textGeo.faces[ i ];
                if ( face.materialIndex == 1 ) {
                    for ( let j = 0; j < face.vertexNormals.length; j ++ ) {
                        face.vertexNormals[ j ].z = 0;
                        face.vertexNormals[ j ].normalize();
                    }
                    let va = this.textGeo.vertices[ face.a ];
                    let vb = this.textGeo.vertices[ face.b ];
                    let vc = this.textGeo.vertices[ face.c ];
                    let s = THREE.GeometryUtils.triangleArea( va, vb, vc );
                    if ( s > triangleAreaHeuristics ) {
                        for ( let j = 0; j < face.vertexNormals.length; j ++ ) {
                            face.vertexNormals[ j ].copy( face.normal );
                        }
                    }
                }
            }
        }
        let centerOffset = -0.5 * ( this.textGeo.boundingBox.max.x - this.textGeo.boundingBox.min.x );
        this.textMesh1 = new THREE.Mesh( this.textGeo, new THREE.MeshNormalMaterial() );
        this.textMesh1.position.x = centerOffset;
        this.textMesh1.position.y = this.hover;
        this.textMesh1.position.z = 0;
        this.textMesh1.rotation.x = 0;
        this.textMesh1.rotation.y = Math.PI * 2;
        this.textMesh1.name = 'text';
        this.textMesh1.position.x = -0.36;
        this.textMesh1.position.y = -0.34;
        this.textMesh1.position.z = -0.24;
        this.textMesh1.rotation.y = 0.7;
        this.textMesh1.scale.x = 0.002;
        this.textMesh1.scale.y = 0.002;
        this.textMesh1.scale.z = 0.002;
        console.log(this.textMesh1);
        //this.textMesh1.material.type = "MeshNormalMaterial";
        this.textMesh1.castShadow = true;
        this.scene.add( this.textMesh1 );
        this.objects.push(this.textMesh1);
    };

}

new Viewer();


