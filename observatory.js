import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class ObservatoryScene extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            sphere: new defs.Subdivision_Sphere(5),
            capped_cylinder: new defs.Capped_Cylinder(10, 10),
            cube: new defs.Cube(),
            square: new defs.Square(),
            triangle: new defs.Triangle(),
            cylinder: new defs.Cylindrical_Tube(15, 15),
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            grass: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0, color: hex_color("#466d46")}),
            dark_grass: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0, color: hex_color("#2f5128")}),
            light_grass: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0, color: hex_color("#4d7c32")}),
            concrete: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: hex_color("#cecdcb")}),
            observatory_roof: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: hex_color("#161c96")}),
            observatory_decoration: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: hex_color("#1e6b61")}),
            sky: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#87CEEB")}),
        }

        this.initial_camera_location = Mat4.look_at(vec3(-35, 13, -20), vec3(0, 5, 25), vec3(0, 1, 0));
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Example Command Name", ["Control", "0"], () => this.attached = () => null);
        this.new_line();
    }

    display_windows(context, program_state) {
        let window_offset = 3;
        while (window_offset < 13) {
            let window_transform = Mat4.identity().times(Mat4.translation(window_offset, 4.7, 13).times(Mat4.scale(0.5,1,2)));
            this.shapes.cube.draw(context, program_state, window_transform, this.materials.concrete);
            let back_plate_transform = window_transform.times(Mat4.translation(2,0,1));
            this.shapes.square.draw(context, program_state, back_plate_transform, this.materials.concrete);
            window_offset += 2;
        }
        window_offset = -3.5;
        while (window_offset > -14) {
            let window_transform = Mat4.identity().times(Mat4.translation(window_offset, 4.7, 13).times(Mat4.scale(0.5,1,2)));
            this.shapes.cube.draw(context, program_state, window_transform, this.materials.concrete);
            let back_plate_transform = window_transform.times(Mat4.translation(-2,0,1));
            this.shapes.square.draw(context, program_state, back_plate_transform, this.materials.concrete);
            window_offset -= 2;
        }
    }

    display_entryway(context, program_state) {
        let left_doorway_transform = Mat4.identity().times(Mat4.translation(2, 4, 13).times(Mat4.scale(0.5,2,2)));
        this.shapes.cube.draw(context, program_state, left_doorway_transform, this.materials.concrete);
        let right_doorway_transform = Mat4.identity().times(Mat4.translation(-2.5, 4, 13).times(Mat4.scale(0.5,2,2)));
        this.shapes.cube.draw(context, program_state, right_doorway_transform, this.materials.concrete);
        let entryway_top = Mat4.identity().times(Mat4.translation(-0.25, 6.25, 13).times(Mat4.scale(3,.25,2)));
        this.shapes.cube.draw(context, program_state, entryway_top, this.materials.concrete);
        let entryway_bottom = Mat4.identity().times(Mat4.translation(-0.25, 3.25, 13).times(Mat4.scale(3,.25,2)));
        this.shapes.cube.draw(context, program_state, entryway_bottom, this.materials.concrete);
    }

    display_roofs(context, program_state) {
        let roof_1_size = 5.85;
        let roof_1_transform = Mat4.identity().times(Mat4.translation(0, 8, 25)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(roof_1_size, roof_1_size, roof_1_size));
        this.shapes.sphere.draw(context, program_state, roof_1_transform, this.materials.observatory_roof);
        let roof_separation = 6.15;
        let roof_2_transform = roof_1_transform.times(Mat4.scale(0.4, 0.4, 0.4)).times(Mat4.translation(roof_separation, -5.125, 0.5));
        this.shapes.sphere.draw(context, program_state, roof_2_transform, this.materials.observatory_roof);
        let roof_3_transform = roof_2_transform.times(Mat4.translation(-2.0 * roof_separation, 0, 0))
        this.shapes.sphere.draw(context, program_state, roof_3_transform, this.materials.observatory_roof);
    }

    display_building_body (context, program_state) {
        let building_center_transform = Mat4.identity().times(Mat4.translation(0, 4.5, 21)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(5, 6, 2));
        this.shapes.cube.draw(context, program_state, building_center_transform, this.materials.concrete);
        let building_topper_cube = building_center_transform.times(Mat4.translation(0, -1, -1)).times(Mat4.scale(0.7, 0.5, 0.25));
        this.shapes.cube.draw(context, program_state, building_topper_cube, this.materials.concrete);
        let building_topper_cylinder = building_topper_cube.times(Mat4.translation(0, 0, -1.5)).times(Mat4.scale(1, 1, 1.25));
        this.shapes.capped_cylinder.draw(context, program_state, building_topper_cylinder, this.materials.observatory_decoration);
        let building_topper_sphere = building_topper_cylinder.times(Mat4.scale(0.8, 0.8, 2)).times(Mat4.translation(0, 0, 0));
        this.shapes.sphere.draw(context, program_state, building_topper_sphere, this.materials.observatory_decoration);
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
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let cylinder_1_transform = Mat4.identity().times(Mat4.translation(0, 3, 25)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(6, 6, 10));
        this.shapes.cylinder.draw(context, program_state, cylinder_1_transform, this.materials.concrete);
        let small_dome_separation = 6;
        let cylinder_2_transform = cylinder_1_transform.times(Mat4.scale(0.4, 0.4, 0.8)).times(Mat4.translation(small_dome_separation, -5, 0));
        this.shapes.cylinder.draw(context, program_state, cylinder_2_transform, this.materials.concrete);
        let cylinder_3_transform = cylinder_2_transform.times(Mat4.translation(-2.0 * small_dome_separation, 0, 0))
        this.shapes.cylinder.draw(context, program_state, cylinder_3_transform, this.materials.concrete);
        let left_wall_transform = Mat4.identity().times(Mat4.translation(8, 6, 13).times(Mat4.scale(5.5,.5,2)));
        let lower_left_wall_transform = left_wall_transform.times(Mat4.translation(0, -5, 0));
        let right_wall_transform = left_wall_transform.times(Mat4.translation(-3, 0, 0));
        let lower_right_wall_transform = right_wall_transform.times(Mat4.translation(0, -5, 0));
        this.shapes.cube.draw(context, program_state, left_wall_transform, this.materials.concrete);
        this.shapes.cube.draw(context, program_state, lower_left_wall_transform, this.materials.concrete);
        this.shapes.cube.draw(context, program_state, right_wall_transform, this.materials.concrete);
        this.shapes.cube.draw(context, program_state, lower_right_wall_transform, this.materials.concrete);
        this.display_windows(context, program_state);
        this.display_entryway(context, program_state);
        this.display_roofs(context, program_state);
        this.display_building_body(context, program_state);
    }
}