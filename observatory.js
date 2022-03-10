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
                {ambient: 1, diffusivity: 0.9, specularity: 0.1, color: hex_color("#c2c0c0")}),
            concrete2: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0.9, specularity: 0.1, color: hex_color("#868686")}),
            balconytop: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0.9, specularity: 0, color: hex_color("#ababab")}),
            observatory_roof: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0.5, color: hex_color("#161c96")}),
            balcony_stairs: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: hex_color("#565656")}),
            observatory_decoration: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, specularity: 0.5, color: hex_color("#1e6b61")}),
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
            let front_plate_transform = back_plate_transform.times(Mat4.translation(0,0,-1));
            this.shapes.square.draw(context, program_state, front_plate_transform, this.materials.concrete);
            window_offset += 2;
        }
        window_offset = -3.5;
        while (window_offset > -14) {
            let window_transform = Mat4.identity().times(Mat4.translation(window_offset, 4.7, 13).times(Mat4.scale(0.5,1,2)));
            this.shapes.cube.draw(context, program_state, window_transform, this.materials.concrete);
            let back_plate_transform = window_transform.times(Mat4.translation(-2,0,1));
            this.shapes.square.draw(context, program_state, back_plate_transform, this.materials.concrete);
            let front_plate_transform = back_plate_transform.times(Mat4.translation(0,0,-1));
            this.shapes.square.draw(context, program_state, front_plate_transform, this.materials.concrete);
            window_offset -= 2;
        }
    }

    display_frontWall_columns(context, program_state)
    {
        //Right Hand Vertical Columns
        let column1_transform = Mat4.identity().times(Mat4.translation(5, 4.3, 11.7).times(Mat4.scale(0.40,2,1)));
        let column2_transform = Mat4.identity().times(Mat4.translation(7, 4.3, 11.7).times(Mat4.scale(0.40,2,1)));
        let column3_transform = Mat4.identity().times(Mat4.translation(9, 4.3, 11.7).times(Mat4.scale(0.40,2,1)));
        let column4_transform = Mat4.identity().times(Mat4.translation(11, 4.3, 11.7).times(Mat4.scale(0.40,2,1)));

        this.shapes.cube.draw(context, program_state, column1_transform, this.materials.concrete2);
        this.shapes.cube.draw(context, program_state, column2_transform, this.materials.concrete2);
        this.shapes.cube.draw(context, program_state, column3_transform, this.materials.concrete2);
        this.shapes.cube.draw(context, program_state, column4_transform, this.materials.concrete2);

        //Left hand Vertical Columns
        let column5_transform = Mat4.identity().times(Mat4.translation(-5.5, 4.3, 11.7).times(Mat4.scale(0.40,2,1)));
        let column6_transform = Mat4.identity().times(Mat4.translation(-7.5, 4.3, 11.7).times(Mat4.scale(0.40,2,1)));
        let column7_transform = Mat4.identity().times(Mat4.translation(-9.5, 4.3, 11.7).times(Mat4.scale(0.40,2,1)));
        let column8_transform = Mat4.identity().times(Mat4.translation(-11.5, 4.3, 11.7).times(Mat4.scale(0.40,2,1)));

        this.shapes.cube.draw(context, program_state, column5_transform, this.materials.concrete2);
        this.shapes.cube.draw(context, program_state, column6_transform, this.materials.concrete2);
        this.shapes.cube.draw(context, program_state, column7_transform, this.materials.concrete2);
        this.shapes.cube.draw(context, program_state, column8_transform, this.materials.concrete2);

        //Right Hand Horizontal column
        let column9_transform = Mat4.identity().times(Mat4.translation(8, 6.5, 10.9).times(Mat4.scale(5,0.30,0.15)));
        this.shapes.cube.draw(context, program_state, column9_transform, this.materials.concrete2);


        //Left Hand Horizontal column
        let column10_transform = Mat4.identity().times(Mat4.translation(-8.5, 6.5, 10.9).times(Mat4.scale(5,0.30,0.15)));
        this.shapes.cube.draw(context, program_state, column10_transform, this.materials.concrete2);

    }

    display_entryway(context, program_state) {

        let ycoord = 3.65;
        let zcoord = 10.75;

        let left_doorway_transform = Mat4.identity().times(Mat4.translation(2, 4, 12).times(Mat4.scale(0.5,2,2)));
        this.shapes.cube.draw(context, program_state, left_doorway_transform, this.materials.concrete2);
        let right_doorway_transform = Mat4.identity().times(Mat4.translation(-2.5, 4, 12).times(Mat4.scale(0.5,2,2)));
        this.shapes.cube.draw(context, program_state, right_doorway_transform, this.materials.concrete2);
        let entryway_top = Mat4.identity().times(Mat4.translation(-0.25, 6.25, 12).times(Mat4.scale(3,.25,2)));
        this.shapes.cube.draw(context, program_state, entryway_top, this.materials.concrete);
        let entryway_bottom = Mat4.identity().times(Mat4.translation(-0.25, 3.25, 13).times(Mat4.scale(3,.45,2)));
        this.shapes.cube.draw(context, program_state, entryway_bottom, this.materials.concrete);
        //drawing doorway stairs
        let doorWayStairTransform = Mat4.identity();
        for (let i = 0; i < 7 ; i++)
        {
            this.shapes.cube.draw(context, program_state, doorWayStairTransform.times(Mat4.translation(-0.25,ycoord,zcoord)).times(Mat4.scale(3.75,0.08,2)), this.materials.concrete2);
            ycoord = ycoord - 0.10;
            zcoord = zcoord - 0.25;
        }

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
        let roofTop1 = Mat4.identity().times(Mat4.translation(8,7,13)).times(Mat4.scale(3.5,.25,1.5));
        this.shapes.cube.draw(context, program_state, roofTop1, this.materials.concrete2);
        let roofTop2 = Mat4.identity().times(Mat4.translation(-8,7,13)).times(Mat4.scale(3.5,.25,1.5));
        this.shapes.cube.draw(context, program_state, roofTop2, this.materials.concrete2);
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

    display_back_balconies (context, program_state) {
        let balcony1 = Mat4.identity().times(Mat4.translation(9.5,4.1,20)).times(Mat4.scale(4.5,1,5));
        this.shapes.cube.draw(context, program_state, balcony1, this.materials.concrete);
        let balcony2 = Mat4.identity().times(Mat4.translation(-9.5,4.1,20)).times(Mat4.scale(4.5,1,5));
        this.shapes.cube.draw(context, program_state, balcony2, this.materials.concrete);
        let balconyFloor1 = Mat4.identity().times(Mat4.translation(10,4.2,20)).times(Mat4.scale(3.9,1,4.5));
        this.shapes.cube.draw(context, program_state, balconyFloor1, this.materials.balconytop);
        let balconyFloor2 = Mat4.identity().times(Mat4.translation(-10,4.2,20)).times(Mat4.scale(3.9,1,4.5));
        this.shapes.cube.draw(context, program_state, balconyFloor2, this.materials.balconytop);

    }

    display_balcony_stairs(context, program_state)
    {
        let stairTransform = Mat4.identity();

        //Left Stairs
        let ycoord1 = 3.1;
        let zcoord1 = 13;
        let xcoord1 = 17.5;
        let rotation1 = 0;
        let xscale1 = 1.3;

        for (let i = 0; i < 20 ; i++)
        {
            this.shapes.cube.draw(context, program_state, stairTransform.times(Mat4.translation(xcoord1,ycoord1,zcoord1)).times(Mat4.scale(xscale1,0.08,2)).times(Mat4.rotation(rotation1,0,10,0)), this.materials.concrete2);
            ycoord1 = ycoord1 + 0.10;
            zcoord1 = zcoord1 + 0.25;
            xcoord1 = xcoord1 - 0.35;
            rotation1 = rotation1 - 0.1;
            xscale1 = xscale1 + 0.2;
        }

        //Right Stairs
        let ycoord2 = 3.1;
        let zcoord2 = 13;
        let xcoord2 = -17.5;
        let rotation2 = 0;
        let xscale2 = 1.3;

        for (let i = 0; i < 20 ; i++)
        {
            this.shapes.cube.draw(context, program_state, stairTransform.times(Mat4.translation(xcoord2,ycoord2,zcoord2)).times(Mat4.scale(xscale2,0.08,2)).times(Mat4.rotation(rotation2,0,10,0)), this.materials.concrete2);
            ycoord2 = ycoord2 + 0.10;
            zcoord2 = zcoord2 + 0.25;
            xcoord2 = xcoord2 + 0.35;
            rotation2 = rotation2 + 0.1;
            xscale2 = xscale2 + 0.2;
        }
    }

    display_balcony_fence(context, program_state)
    {
        let mainTrans = Mat4.identity();

        this.shapes.cube.draw(context, program_state, mainTrans.times(Mat4.translation(9.5,6.1,24.5)).times(Mat4.scale(4,0.10,0.10)), this.materials.balcony_stairs);
        this.shapes.cube.draw(context, program_state, mainTrans.times(Mat4.translation(13.5,6.1,22.5)).times(Mat4.scale(0.10,0.10,2)), this.materials.balcony_stairs);
        this.shapes.cube.draw(context, program_state, mainTrans.times(Mat4.translation(13.5,5.7,20.5)).times(Mat4.scale(0.10,0.5,0.10)), this.materials.balcony_stairs);
        this.shapes.cube.draw(context, program_state, mainTrans.times(Mat4.translation(13.5,5.7,24.5)).times(Mat4.scale(0.10,0.5,0.10)), this.materials.balcony_stairs);


        this.shapes.cube.draw(context, program_state, mainTrans.times(Mat4.translation(-9.5,6.1,24.5)).times(Mat4.scale(4,0.10,0.10)), this.materials.balcony_stairs);
        this.shapes.cube.draw(context, program_state, mainTrans.times(Mat4.translation(-13.5,6.1,22.5)).times(Mat4.scale(0.10,0.10,2)), this.materials.balcony_stairs);
        this.shapes.cube.draw(context, program_state, mainTrans.times(Mat4.translation(-13.5,5.7,20.5)).times(Mat4.scale(0.10,0.5,0.10)), this.materials.balcony_stairs);
        this.shapes.cube.draw(context, program_state, mainTrans.times(Mat4.translation(-13.5,5.7,24.5)).times(Mat4.scale(0.10,0.5,0.10)), this.materials.balcony_stairs);

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

        this.shapes.cylinder.draw(context, program_state, cylinder_1_transform, this.materials.concrete2);
        this.shapes.cylinder.draw(context, program_state, cylinder_1_transform.times(Mat4.scale(1.1,1.1,0.9)), this.materials.concrete);


        let small_dome_separation = 6;
        let cylinder_2_transform = cylinder_1_transform.times(Mat4.scale(0.4, 0.4, 0.8)).times(Mat4.translation(small_dome_separation, -5, 0));

        this.shapes.cylinder.draw(context, program_state, cylinder_2_transform, this.materials.concrete2);
        this.shapes.cylinder.draw(context, program_state, cylinder_2_transform.times(Mat4.scale(1.1,1.1,0.9)), this.materials.concrete);

        let cylinder_3_transform = cylinder_2_transform.times(Mat4.translation(-2.0 * small_dome_separation, 0, 0))

        this.shapes.cylinder.draw(context, program_state, cylinder_3_transform, this.materials.concrete2);
        this.shapes.cylinder.draw(context, program_state, cylinder_3_transform.times(Mat4.scale(1.1,1.1,0.9)), this.materials.concrete);

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
        this.display_frontWall_columns(context, program_state);
        this.display_back_balconies(context, program_state);
        this.display_balcony_stairs(context, program_state);
        this.display_balcony_fence(context,program_state);

        }
}