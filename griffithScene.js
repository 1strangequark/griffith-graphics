import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class GriffithScene extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        this.camera_activity_time = 0;
        this.camera_activity = "";
        this.orbit_time = 9;
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            torus: new defs.Torus(15, 15),
            torus2: new defs.Torus(3, 15),
            sphere: new defs.Subdivision_Sphere(2),
            sphere2: new defs.Subdivision_Sphere(4),
            circle: new defs.Regular_2D_Polygon(1, 30),
            cube: new defs.Cube(),
            square: new defs.Square(),
            triangle: new defs.Triangle(),
            axes: new defs.Axis_Arrows(),
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .5, diffusivity: .6, color: hex_color("#ffffff")}),
            grass: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0, color: hex_color("#466d46")}),
            dark_grass: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0, color: hex_color("#2f5128")}),
            light_grass: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0, color: hex_color("#4d7c32")}),
            tree_leaves: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0, color: hex_color("#5aab61")}),
            tree_trunk: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0, color: hex_color("#795c34")}),
            concrete: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: hex_color("#dbdbdd")}),
            sky: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#87CEEB")}),
            lightBase: new Material(new defs.Phong_Shader(),
                {ambient: 0.7, diffusivity: 0.5, specularity: 1, color: hex_color("#989292")}),
            lightBulb: new Material(new defs.Phong_Shader(),
                {ambient: 1, color: hex_color("#bdad07")}),
        }

        this.initial_camera_location = Mat4.look_at(vec3(-35, 13, -20), vec3(0, 5, 25), vec3(0, 1, 0));
    }

    setCameraActivity(activity) {
        this.camera_activity = activity;
        this.camera_activity_time = 0;
        this.orbit_time = 9;
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Free Movement", ["Control", "0"], () => this.setCameraActivity("Start"));
        this.key_triggered_button("Orbit", ["Control", "0"], () => this.setCameraActivity("Orbit"));
        this.new_line();
    }

    display_grass_patches(context, program_state) {

        let platform_grass_transform = Mat4.identity().times(Mat4.translation(10, 3.05, 0)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(3, 5, 3));
        let platform_grass_transform2 = platform_grass_transform.times(Mat4.translation(0, -2.2, 0));
        let platform_grass_transform3 = platform_grass_transform.times(Mat4.translation(-2.4, 0, 0));
        let platform_grass_transform4 = platform_grass_transform2.times(Mat4.translation(-2.4, 0, 0));
        let platform_grass_transform5 = platform_grass_transform.times(Mat4.translation(-6.5, -1, 0)).times(Mat4.scale(2.5, 2, 2));

        let material = this.materials.light_grass;
        this.shapes.square.draw(context, program_state, platform_grass_transform, material);
        this.shapes.square.draw(context, program_state, platform_grass_transform2, material);
        this.shapes.square.draw(context, program_state, platform_grass_transform3, material);
        this.shapes.square.draw(context, program_state, platform_grass_transform4, material);
        this.shapes.square.draw(context, program_state, platform_grass_transform5, material);

    }
    
    // Use this function to draw trees
    // version is to select a different version of tree (default is 1))
    display_tree(context, program_state, x, y, z, version = 1) {
        if (version == 1) {
            let leaves_transform = Mat4.identity().times(Mat4.translation(x, y+5, z));
            let trunk_transform = leaves_transform.times(Mat4.scale(.1, 1, .1)).times(Mat4.translation(0, -1, 0));
            this.shapes.sphere.draw(context, program_state, leaves_transform, this.materials.tree_leaves);
            this.shapes.cube.draw(context, program_state, trunk_transform, this.materials.tree_trunk);
        }
        else {
            let leaves_transform = Mat4.identity().times(Mat4.translation(x, y+5, z));
            let leaves2_transform = leaves_transform.times(Mat4.translation(0, 1.4, 0)).times(Mat4.scale(1.4, 1.4, 1.4));
            let trunk_transform = leaves_transform.times(Mat4.scale(.1, 1, .1)).times(Mat4.translation(0, -1, 0));
            this.shapes.sphere.draw(context, program_state, leaves_transform, this.materials.tree_leaves);
            this.shapes.sphere.draw(context, program_state, leaves2_transform, this.materials.tree_leaves);
            this.shapes.cube.draw(context, program_state, trunk_transform, this.materials.tree_trunk);
        }
    }

    display_Statue(context, program_state) {

        let platform_statue_transform1 = Mat4.identity().times(Mat4.translation(6.4,3,-5.5)).times(Mat4.scale(0.5,0.75,0.5));
        let platform_statue_transform2 = Mat4.identity().times(Mat4.translation(6.4,4,-5.5)).times(Mat4.scale(0.4,0.8,0.4));
        let platform_statue_transform3 = Mat4.identity().times(Mat4.translation(6.4,5,-5.5)).times(Mat4.scale(0.28,1.5,0.28));
        let platform_statue_transform4 = Mat4.identity().times(Mat4.translation(6.4,6,-5.5)).times(Mat4.scale(0.28,1.5,0.28));

        this.shapes.cube.draw(context, program_state,platform_statue_transform1, this.materials.test);
        this.shapes.cube.draw(context, program_state,platform_statue_transform2, this.materials.test);
        this.shapes.cube.draw(context, program_state,platform_statue_transform3, this.materials.test);
        this.shapes.sphere2.draw(context, program_state,platform_statue_transform4, this.materials.test);

    }

    display_courtyard_light_bases(context, program_state, x, z)
    {

        let platform_light_transform1 = Mat4.identity().times(Mat4.translation(x,3,z)).times(Mat4.scale(0.15,0.4,0.15));
        let platform_light_transform2 = Mat4.identity().times(Mat4.translation(x,3.5,z)).times(Mat4.scale(0.13,0.3,0.13));
        let platform_light_transform3 = Mat4.identity().times(Mat4.translation(x,4,z)).times(Mat4.scale(0.03,1,0.03));
        let platform_light_transform4 = Mat4.identity().times(Mat4.translation(x,5,z)).times(Mat4.scale(0.16,0.16,0.16));

        this.shapes.cube.draw(context, program_state,platform_light_transform1, this.materials.lightBase);
        this.shapes.cube.draw(context, program_state,platform_light_transform3, this.materials.lightBase);
        this.shapes.sphere2.draw(context, program_state,platform_light_transform2, this.materials.lightBase);
        this.shapes.sphere2.draw(context, program_state,platform_light_transform4, this.materials.lightBulb);

    }

        display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        // this.shapes.[XXX].draw([XXX]) // <--example

        const light_position = vec4(0, 5, 5, 1);
        const yellow = hex_color("#fac91a");

        // The parameters of the Light are: position, color, size
        program_state.lights = [
            new Light(light_position, color(0,0,0,1), 9),
            new Light(vec4(5.2, 5, 5.2, 1), yellow, 9),
            new Light(vec4(7.5, 5, 5.2, 1), yellow, 9),
            new Light(vec4(5.2, 5, -16.2, 1), yellow, 9),
            new Light(vec4(7.5, 5, -16.2, 1), yellow, 9),
            new Light(vec4(13.2, 5, -11.2, 1), yellow, 9),
            new Light(vec4(13.2, 5, 0.2, 1), yellow, 9),
            new Light(vec4(-0.45, 5, -11.2, 1), yellow, 9),
            new Light(vec4(-0.45, 5, 0.2, 1), yellow, 9),
            new Light(vec4(-17.2, 5, -11.2, 1), yellow, 9),
            new Light(vec4(-17.2, 5, 0.2, 1), yellow, 9),
            new Light(vec4(-5.2, 5, 5.2, 1), yellow, 9),
            new Light(vec4(-12.5, 5, 5.2, 1), yellow, 9),
            new Light(vec4(-5.2, 5, -15.2, 1), yellow, 9),
            new Light(vec4(-12.5, 5, -15.2, 1), yellow, 9)
        ];

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

            //Draw the ground and sky
        this.shapes.square.draw(context, program_state, Mat4.translation(0, -10, 0)
            .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(1000, 1000, 1)), this.materials.grass);
        this.shapes.sphere.draw(context, program_state, Mat4.scale(500, 500, 500), this.materials.sky);

        // Create platform for observatory to rest on
        let platform_square_transform = Mat4.identity().times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(20, 30, 3));
        this.shapes.cube.draw(context, program_state, platform_square_transform, this.materials.concrete);

        // Create grass on platform
        this.display_grass_patches(context, program_state);

        //create statue in the courtyard
        this.display_Statue(context,program_state);

        const speed_factor = 0.5;
        //CAMERA POSITION
        if (this.camera_activity === "Orbit") {
            this.orbit_time += dt;
            let camera_transform = Mat4.identity().times(Mat4.rotation(this.orbit_time * speed_factor, 0, 1, 0)).times(Mat4.translation(0, 15, 60));
            let camera_position = Mat4.inverse(camera_transform)
            program_state.camera_inverse = camera_position.map((x, i) =>
                Vector.from(program_state.camera_inverse[i]).mix(x, 0.05));
        }

        if (this.camera_activity === "Start") {
            // var camera_transform = this.initial_camera_location;
            let start_mat = Mat4.look_at(vec3(-35, 13, -20), vec3(0, 5, 25), vec3(0, 1, 0));
            program_state.camera_inverse = start_mat.map((x, i) =>
                Vector.from(program_state.camera_inverse[i]).mix(x, 0.05));
            this.camera_activity_time += dt;
            if (this.camera_activity_time > 2) {
               this.setCameraActivity("");
            }
        }

        //courtyard light bases
        this.display_courtyard_light_bases(context,program_state, 5.2,5.2);
        this.display_courtyard_light_bases(context,program_state, 7.5,5.2);
        this.display_courtyard_light_bases(context,program_state, 5.2,-16.2);
        this.display_courtyard_light_bases(context,program_state, 7.5,-16.2);
        this.display_courtyard_light_bases(context,program_state, 13.2,-11.2);
        this.display_courtyard_light_bases(context,program_state, 13.2,0.2);
        this.display_courtyard_light_bases(context,program_state, -0.45,-11.2);
        this.display_courtyard_light_bases(context,program_state, -0.45,0.2);
        this.display_courtyard_light_bases(context,program_state, -17.2,-11.2);
        this.display_courtyard_light_bases(context,program_state, -17.2,0.2);
        this.display_courtyard_light_bases(context,program_state, -5.2,5.2);
        this.display_courtyard_light_bases(context,program_state, -12.5,5.2);
        this.display_courtyard_light_bases(context,program_state, -5.2,-15.2);
        this.display_courtyard_light_bases(context,program_state, -12.5,-15.2);


        //Create a hill
        let hill_transform = Mat4.identity().times(Mat4.translation(0, -10, 0)).times(Mat4.scale(70, 13, 70));
        this.shapes.sphere.draw(context, program_state, hill_transform, this.materials.dark_grass);

        // Create trees on platform
            // front and back (camera view)
        let x = -23;
        for (let i = 0; i < 2; i ++) {
            this.display_tree(context, program_state, x, -2.4, -16, 2);
            this.display_tree(context, program_state, x, -2.2, -13, 1);
            this.display_tree(context, program_state, x, -2, -10, 2);
            this.display_tree(context, program_state, x, -1.8, -7, 1);
            this.display_tree(context, program_state, x, -1.5, -4, 2);
            this.display_tree(context, program_state, x, -1.6, -1, 1);
            this.display_tree(context, program_state, x, -1.8, 2, 2);
            this.display_tree(context, program_state, x, -1.9, 5, 1);
            this.display_tree(context, program_state, x, -2, 8, 2);
            x = 25;
        }
            // platform
        this.display_tree(context, program_state, -4, 0, 4, 2);
        this.display_tree(context, program_state, 4, 0, -7, 2);
        this.display_tree(context, program_state, 4, 0, -9, 1);
    }
}