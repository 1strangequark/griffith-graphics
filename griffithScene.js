import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Texture, Scene,
} = tiny;

const {Textured_Phong} = defs
const SPEED_UP = 1;
const SLOW_DOWN = -1;

export class GriffithScene extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.num_buildings = 40;
        this.lights_size = 0;
        this.starSize = 0;
        this.camera_activity_time = 0;
        this.camera_activity = "";
        this.orbit_time = 9;
        this.building_props = [];
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            torus: new defs.Torus(15, 15),
            torus2: new defs.Torus(3, 15),
            sphere: new defs.Subdivision_Sphere(2),
            sphere2: new defs.Subdivision_Sphere(4),
            sphere3: new defs.Subdivision_Sphere(1),
            circle: new defs.Regular_2D_Polygon(1, 30),
            capped_cylinder: new defs.Capped_Cylinder(10, 10),
            cube: new defs.Cube(),
            square: new defs.Square(),
            triangle: new defs.Triangle(),
            axes: new defs.Axis_Arrows(),
            sun: new defs.Subdivision_Sphere(4),

        // TODO:  Fill in as many additional shape instances as needed in this key/value table.
            //        (Requirement 1)
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .5, diffusivity: .6, color: hex_color("#ffffff")}),
            star: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#87CEEB")}),
            grass: new Material(new defs.Phong_Shader(),
                {ambient: 0.7, diffusivity: 1.0, specularity: 0, color: hex_color("#466d46")}),
            dark_grass: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0, color: hex_color("#2f5128")}),
            light_grass: new Material(new defs.Phong_Shader(),
                {ambient: 0.6, diffusivity: 1.0, specularity: 0, color: hex_color("#4d7c32")}),
            tree_leaves: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 1.0, specularity: 0, color: hex_color("#5aab61")}),
            tree_trunk: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0, color: hex_color("#795c34")}),
            concrete: new Material(new defs.Phong_Shader(),
                {ambient: 0.8, diffusivity: 1, specularity: 0, color: hex_color("#93939b")}),
            sky: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#87CEEB")}),
            lightBase: new Material(new defs.Phong_Shader(),
                {ambient: 0.7, diffusivity: 0.5, specularity: 1, color: hex_color("#989292")}),
            lightBulb: new Material(new defs.Phong_Shader(),
                {ambient: 1, specularity: 1, color: hex_color("#bdad07")}),
            bushBase: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0, color: hex_color("#4d3206")}),
            sun:  new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0,color: hex_color("#feff05")}),
            building: new Material(new Textured_Phong(),
                {ambient: 0.8, diffusivity: 1, specularity: 1, color: hex_color("#000000"), texture: new Texture("assets/building.png")}),
            building_dark: new Material(new Textured_Phong(),
                {ambient: 1, diffusivity: 1, specularity: 1, color: hex_color("#000000"), texture: new Texture("assets/building_night.png")}),
        }

        this.initial_camera_location = Mat4.look_at(vec3(-35, 13, -20), vec3(0, 5, 25), vec3(0, 1, 0));

        this.sun = {
            sun_rise: true,
            day_night_interval: 0,
            day_night_period: 10,
            max_day_night_interval: 0,
            track_transition: 0,
            max_interval: 10.5,
            transition: 1,
            max_day_interval: 10.5 * 2,
            theta : Math.PI / 10,
            transform: Mat4.identity(),
        }
        this.update_building_coords();
    }

    change_day_night_period(speed_up) {
        // min is 1
        if(speed_up == SLOW_DOWN){
            this.sun.day_night_period += 1;
        } else if(speed_up == SPEED_UP) {
            if(this.sun.day_night_period >= 2) {
                this.sun.day_night_period -= 1
            }
        }

        this.sun.max_interval = this.sun.day_night_period + (0.05 * this.sun.day_night_period);
        this.sun.transition = this.sun.day_night_period / 10;
        this.sun.max_day_interval = this.sun.max_interval * 2;
        this.sun.track_transition = 0;
        this.sun.day_night_interval = 0;
        this.sun.max_day_night_interval = 0;
        this.sun.theta =  Math.PI / this.sun.day_night_period;
        let identity = Mat4.identity();
        this.sun.transform = identity;
        this.sun.sun_rise = true;
    }

    setCameraActivity(activity) {
        this.camera_activity = activity;
        this.camera_activity_time = 0;
        this.orbit_time = 9;
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Speed up day/night cycle", ["i"], () => this.change_day_night_period(SPEED_UP));
        this.key_triggered_button("Slow down day/night cycle", ["Shift", "I"], () => this.change_day_night_period(SLOW_DOWN));
        this.new_line();
        this.live_string(box => {
            box.textContent = "Length of day/night: " + (this.sun.day_night_period) + " seconds";
        });
        this.new_line();
        this.key_triggered_button("Free Movement", ["Control", "0"], () => this.setCameraActivity("Start"));
        this.key_triggered_button("Orbit", ["Control", "1"], () => this.setCameraActivity("Orbit"));
        this.new_line();
        this.new_line();
        this.key_triggered_button("Respawn Buildings", ["n"], () => this.update_building_coords());
        this.live_string(box => {
            box.textContent = "Number of Buildings: " + (this.num_buildings);
        });
        this.key_triggered_button("Increase Buildings", ["b"], () => this.incrementBuildings());
        this.key_triggered_button("Decrease Buildings", ["v"], () => this.decrementBuildings());

    }

    incrementBuildings() {
        if (this.num_buildings < 75) {
            this.num_buildings += 1;
            this.update_building_coords()
        }
    }

    decrementBuildings() {
        if (this.num_buildings >= 1) {
            this.num_buildings -= 1;
            this.update_building_coords()
        }
    }

    day_night_sequence(context, program_state, t, dt) {
        // period is the duration of day or night
        // i.e. period of 10 => day cycle lasts 10 seconds and night cycle lasts 10 seconds
        this.sun.theta = Math.PI / this.sun.day_night_period;
        let transform = Mat4.identity();

        this.sun.day_night_interval += dt;
        this.sun.max_day_night_interval += dt;

        if (this.sun.day_night_interval >= this.sun.max_interval) {
            this.sun.day_night_interval = 0;
            this.sun.sun_rise = !this.sun.sun_rise;
        }

        if (this.sun.max_day_night_interval >= this.sun.max_day_interval) {
            this.sun.max_day_night_interval = 0;
        }

        let x = 200 + 200 * Math.cos(this.sun.theta * this.sun.day_night_interval);
        let y = 5 + 200 * Math.sin(this.sun.theta * this.sun.day_night_interval);
        let z_1 = 215 + 190 * Math.sin(this.sun.theta * this.sun.day_night_interval / 2);
        let sky_color_x, sky_color_y, sky_color_z;
        let sky_color;
        let radius = 0;
        if (this.sun.sun_rise)
            radius = 1000 ** 10;
        else
            radius = 0;

        if ((this.sun.max_day_night_interval < this.sun.max_interval + this.sun.transition * 2) && (this.sun.max_day_night_interval > this.sun.max_interval - this.sun.transition / 2)) {
            // sunset
            this.sun.track_transition += dt;
            sky_color_x = 0.59 - 0.51 * Math.sin((Math.PI / (this.sun.transition * 5)) * this.sun.track_transition);
            sky_color_y = 0.76 - 0.52 * Math.sin((Math.PI / (this.sun.transition * 5)) * this.sun.track_transition);
            sky_color_z = 0.94 - 0.55 * Math.sin((Math.PI / (this.sun.transition * 5)) * this.sun.track_transition);

            if (this.sun.track_transition >= (this.sun.transition * 5) / 2)
                sky_color = color(0.08, 0.24, 0.39, 1);
            else
                sky_color = color(sky_color_x, sky_color_y, sky_color_z, 1);
            this.lights_size = 9;
            this.starSize = 10;

        } else if (this.sun.max_day_night_interval < this.sun.transition) {
            // end of sunrise
            this.sun.track_transition = 0;
            sky_color_x = 0.18 + 0.41 * Math.sin((Math.PI / (this.sun.transition * 2)) * this.sun.max_day_night_interval);
            sky_color_y = 0.50 + 0.26 * Math.sin((Math.PI / (this.sun.transition * 2)) * this.sun.max_day_night_interval);
            sky_color_z = 0.66 + 0.28 * Math.sin((Math.PI / (this.sun.transition * 2)) * this.sun.max_day_night_interval);

            if (this.sun.track_transition >= this.sun.transition)
                sky_color = color(0.59, 0.76, 0.94, 1);
            else
                sky_color = color(sky_color_x, sky_color_y, sky_color_z, 1);
            this.lights_size = 0;
            this.starSize = 0;


        } else if (this.sun.max_day_night_interval > this.sun.max_day_interval - this.sun.transition / 3) {
            // beginning of sunrise
            this.sun.track_transition += dt;
            sky_color_x = 0.08 + 0.10 * Math.sin((Math.PI / (this.sun.transition * 2)) * this.sun.track_transition);
            sky_color_y = 0.24 + 0.26 * Math.sin((Math.PI / (this.sun.transition * 2)) * this.sun.track_transition);
            sky_color_z = 0.39 + 0.27 * Math.sin((Math.PI / (this.sun.transition * 2)) * this.sun.track_transition);

            if (this.sun.track_transition >= this.sun.transition)
                sky_color = color(0.08, 0.24, 0.39, 1);
            else
                sky_color = color(sky_color_x, sky_color_y, sky_color_z, 1);

        } else {
            this.sun.track_transition = 0;

            if (this.sun.sun_rise)
                sky_color = color(0.59, 0.76, 0.94, 1);
            else
                sky_color = color(0.08, 0.24, 0.39, 1);
        }

        this.sun.transform = transform.times(Mat4.translation(x, y, z_1)).times(Mat4.scale(5, 5, 5));
        let light_position = vec4(this.sun.transform[0][3], -this.sun.transform[1][3], this.sun.transform[2][3], this.sun.transform[3][3]);

        return {
            light_position,
            radius,
            sky_color
        };
    }
    display_grass_patches(context, program_state) {

        let platform_grass_transform = Mat4.identity().times(Mat4.translation(10, 3.05, 0)).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(3, 5, 3));
        let platform_grass_transform2 = platform_grass_transform.times(Mat4.translation(0, -2.2, 0));
        let platform_grass_transform3 = platform_grass_transform.times(Mat4.translation(-2.4, 0, 0));
        let platform_grass_transform4 = platform_grass_transform2.times(Mat4.translation(-2.4, 0, 0));
        let platform_grass_transform5 = platform_grass_transform.times(Mat4.translation(-6.5, -1, 0)).times(Mat4.scale(2.5, 2, 2));
        let platform_grass_transform6 = platform_grass_transform.times(Mat4.translation(-6.25, 2, 0)).times(Mat4.scale(1.4, 0.15, 2));
        let platform_grass_transform7 = platform_grass_transform.times(Mat4.translation(-0.50, 2, 0)).times(Mat4.scale(1.4, 0.15, 2));


        let material = this.materials.light_grass;
        this.shapes.square.draw(context, program_state, platform_grass_transform, material);
        this.shapes.square.draw(context, program_state, platform_grass_transform2, material);
        this.shapes.square.draw(context, program_state, platform_grass_transform3, material);
        this.shapes.square.draw(context, program_state, platform_grass_transform4, material);
        this.shapes.square.draw(context, program_state, platform_grass_transform5, material);
        this.shapes.square.draw(context, program_state, platform_grass_transform6, material);
        this.shapes.square.draw(context, program_state, platform_grass_transform7, material);



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
    display_Entry_bushes(context, program_state)
    {
        let bush_transform1 = Mat4.identity().times(Mat4.translation(2.0,5,9.2)).times(Mat4.scale(0.25,1.25,0.25));
        let bush_transform2 = Mat4.identity().times(Mat4.translation(-2.4,5,9.2)).times(Mat4.scale(0.25,1.25,0.25));

        this.shapes.sphere3.draw(context, program_state,bush_transform1, this.materials.dark_grass);
        this.shapes.sphere3.draw(context, program_state,bush_transform2, this.materials.dark_grass);
        this.shapes.cube.draw(context, program_state,bush_transform1.times(Mat4.scale(1,0.15,1)).times(Mat4.translation(0,-5,0)), this.materials.bushBase);
        this.shapes.cube.draw(context, program_state,bush_transform2.times(Mat4.scale(1,0.15,1)).times(Mat4.translation(0,-5,0)), this.materials.bushBase);
    }

    display_Side_bushes(context, program_state)
    {
        let bush_transform1 = Mat4.identity().times(Mat4.translation(6.0,3.8,9.9)).times(Mat4.scale(0.35,0.9,0.35));
        let bush_transform2 = Mat4.identity().times(Mat4.translation(10.0,3.8,9.9)).times(Mat4.scale(0.35,0.9,0.35));

        let bush_transform3 = Mat4.identity().times(Mat4.translation(-6.4,3.8,9.9)).times(Mat4.scale(0.35,0.9,0.35));
        let bush_transform4 = Mat4.identity().times(Mat4.translation(-10.4,3.8,9.9)).times(Mat4.scale(0.35,0.9,0.35));

        this.shapes.sphere3.draw(context, program_state,bush_transform1, this.materials.dark_grass);
        this.shapes.sphere3.draw(context, program_state,bush_transform2, this.materials.dark_grass);
        this.shapes.sphere3.draw(context, program_state,bush_transform3, this.materials.dark_grass);
        this.shapes.sphere3.draw(context, program_state,bush_transform4, this.materials.dark_grass);

    }

    display_HollywoodSign(context, program_state)
    {
        //Creating the Hills
        let hill_transform2 = Mat4.identity().times(Mat4.translation(-250, 10, -70)).times(Mat4.scale(70, 40, 70));
        let hill_transform3 = Mat4.identity().times(Mat4.translation(-270, 30, -20)).times(Mat4.scale(45, 40, 85));
        let hill_transform4 = Mat4.identity().times(Mat4.translation(-250, 5, 10)).times(Mat4.scale(70, 40, 90));
        let hill_transform5 = Mat4.identity().times(Mat4.translation(-200, -15, 10)).times(Mat4.scale(70, 40, 90));
        let hill_transform6 = Mat4.identity().times(Mat4.translation(-200, -15, 50)).times(Mat4.scale(70, 40, 90));
        let hill_transform7 = Mat4.identity().times(Mat4.translation(-200, -15, -100)).times(Mat4.scale(70, 40, 90));




        this.shapes.sphere3.draw(context, program_state, hill_transform2, this.materials.dark_grass);
        this.shapes.sphere3.draw(context, program_state, hill_transform3, this.materials.dark_grass);
        this.shapes.sphere3.draw(context, program_state, hill_transform4, this.materials.dark_grass);
        this.shapes.sphere.draw(context, program_state, hill_transform5, this.materials.dark_grass);
        this.shapes.sphere.draw(context, program_state, hill_transform6, this.materials.dark_grass);
        this.shapes.sphere.draw(context, program_state, hill_transform7, this.materials.dark_grass);



        //Constructing "HOLLYWOOD"

        //Letter H
        let H_trans1 = Mat4.identity().times(Mat4.translation(-220,35,30)).times(Mat4.scale(0.75,4.5,0.75));
        let H_trans2 = Mat4.identity().times(Mat4.translation(-220,35,25)).times(Mat4.scale(0.75,4.5,0.75));
        let H_trans3 = Mat4.identity().times(Mat4.translation(-220,35,27.5)).times(Mat4.scale(0.75,0.75,2));
        //Letter O
        let O_trans1 = Mat4.identity().times(Mat4.translation(-220,38.5,19)).times(Mat4.scale(0.75,0.75,3.5));
        let O_trans2 = Mat4.identity().times(Mat4.translation(-220,31.5,19)).times(Mat4.scale(0.75,0.75,3.5));
        let O_trans3 = Mat4.identity().times(Mat4.translation(-220,35,22)).times(Mat4.scale(0.75,4,0.75));
        let O_trans4 = Mat4.identity().times(Mat4.translation(-220,35,16)).times(Mat4.scale(0.75,4,0.75));
        //Letter L 1
        let L_trans1 = Mat4.identity().times(Mat4.translation(-220,35,13)).times(Mat4.scale(0.75,4,0.75));
        let L_trans2 = Mat4.identity().times(Mat4.translation(-220,31.5,10)).times(Mat4.scale(0.75,0.75,3));
        //Letter L 2
        let L_trans3 = Mat4.identity().times(Mat4.translation(-220,35,5)).times(Mat4.scale(0.75,4,0.75));
        let L_trans4 = Mat4.identity().times(Mat4.translation(-220,31.5,2)).times(Mat4.scale(0.75,0.75,3));
        //Letter Y
        let Y_trans1 = Mat4.identity().times(Mat4.translation(-220,36,-3)).times(Mat4.scale(0.75,2.5,0.75));
        let Y_trans2 = Mat4.identity().times(Mat4.translation(-220,36,-8)).times(Mat4.scale(0.75,2.5,0.75));
        let Y_trans3 = Mat4.identity().times(Mat4.translation(-220,34,-5.5)).times(Mat4.scale(0.75,0.75,2.5));
        let Y_trans4 = Mat4.identity().times(Mat4.translation(-220,32,-5.5)).times(Mat4.scale(0.75,2,0.75));
        //Letter W
        let W_trans1 = Mat4.identity().times(Mat4.translation(-220,35,-11)).times(Mat4.scale(0.75,4,0.75));
        let W_trans2 = Mat4.identity().times(Mat4.translation(-220,35,-18)).times(Mat4.scale(0.75,4,0.75));
        let W_trans3 = Mat4.identity().times(Mat4.translation(-220,31.5,-14.5)).times(Mat4.scale(0.75,0.75,4));
        let W_trans4 = Mat4.identity().times(Mat4.translation(-220,35,-14.5)).times(Mat4.scale(0.75,4,0.75));
        //Letter O2
        let O_trans5 = Mat4.identity().times(Mat4.translation(-220,38.5,-24)).times(Mat4.scale(0.75,0.75,3.5));
        let O_trans6 = Mat4.identity().times(Mat4.translation(-220,31.5,-24)).times(Mat4.scale(0.75,0.75,3.5));
        let O_trans7 = Mat4.identity().times(Mat4.translation(-220,35,-27)).times(Mat4.scale(0.75,4,0.75));
        let O_trans8 = Mat4.identity().times(Mat4.translation(-220,35,-21)).times(Mat4.scale(0.75,4,0.75));
        //Letter O3
        let O_trans9 = Mat4.identity().times(Mat4.translation(-215,40,-33)).times(Mat4.scale(0.75,0.75,3.5));
        let O_trans10 = Mat4.identity().times(Mat4.translation(-215,33,-33)).times(Mat4.scale(0.75,0.75,3.5));
        let O_trans11 = Mat4.identity().times(Mat4.translation(-215,36.5,-36)).times(Mat4.scale(0.75,4,0.75));
        let O_trans12 = Mat4.identity().times(Mat4.translation(-215,36.5,-30)).times(Mat4.scale(0.75,4,0.75));
        //Letter O3
        let D_trans1 = Mat4.identity().times(Mat4.translation(-215,41,-42)).times(Mat4.scale(0.75,0.75,3.5));
        let D_trans2 = Mat4.identity().times(Mat4.translation(-215,34,-42)).times(Mat4.scale(0.75,0.75,3.5));
        let D_trans3 = Mat4.identity().times(Mat4.translation(-215,37.5,-45)).times(Mat4.scale(0.75,4,0.75));
        let D_trans4 = Mat4.identity().times(Mat4.translation(-215,37.5,-39)).times(Mat4.scale(0.75,5.5,0.75));

        this.shapes.cube.draw(context, program_state,H_trans1, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,H_trans2, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,H_trans3, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,O_trans1, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,O_trans2, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,O_trans3, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,O_trans4, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,L_trans1, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,L_trans2, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,L_trans3, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,L_trans4, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,Y_trans1, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,Y_trans2, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,Y_trans3, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,Y_trans4, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,W_trans1, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,W_trans2, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,W_trans3, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,W_trans4, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,O_trans5, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,O_trans6, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,O_trans7, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,O_trans8, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,O_trans9, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,O_trans10, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,O_trans11, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,O_trans12, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,D_trans1, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,D_trans2, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,D_trans3, this.materials.concrete);
        this.shapes.cube.draw(context, program_state,D_trans4, this.materials.concrete);


    }
    validate_distance(x, z, min_dist) {
        // calculate euclidian distance
        var valid = true;
        for (var i = 0; i < this.building_props.length; i++) {
            let distance = Math.sqrt(Math.pow(x - this.building_props[i][0], 2) + Math.pow(z - this.building_props[i][1], 2));
            if (distance < min_dist) {
                valid = false;
            }
        }
        return valid;
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    }

    update_building_coords() {
        let xVar = 200;
        let zVar = 100;
        this.building_props = [];
        for (let i = 0; i < this.num_buildings; i++)
        {
            var x = 0;
            var z = 0;
            do {
                x = 100 + this.getRandomInt(-xVar, xVar);
                z = 200 + this.getRandomInt(-zVar, zVar);
            } while (!this.validate_distance(x, z, 20));
            let height = this.getRandomInt(1, 5);
            this.building_props.push([x,z, height]);
        }
    }

    display_city(context, program_state)
    {
        for (var i = 0; i < this.building_props.length; i++) {
            for (var j = 0; j < this.building_props[i][2]; j++) {
                let square_build_trans = Mat4.identity().times(Mat4.translation(this.building_props[i][0],(j * 10) - 5,this.building_props[i][1])).times(Mat4.scale(5, 5, 5));
                this.shapes.cube.draw(context, program_state, square_build_trans, this.sun.sun_rise ? this.materials.building : this.materials.building_dark);
            }
        }
    }
    displayStars(context, program_state)
    {
        let starTuples = [
            [0,200,150], [20,200,200], [20,200,-175], [35,200,180], [200,200,-250], [250,200,-40], [-100,200,30],
            [-13,200,60], [-10,200,-150], [30,200,-100], [-40,200,250], [125,200,30], [-175,200,20], [200,200,20],
            [150,200,0], [-30,100,740], [-75,200,400], [90,200,-400], [-10,100,400], [-20,150,400], [20,100,400],
            [40,150,400], [-70,90,400], [-50,150,400], [190,120,400], [40,120,400], [-110,140,400], [-120,100,400],
            [90,100,400], [140,120,400], [-10,230,400], [-140,100,400], [140,105,400], [70,90,-400], [50,150,-400],
            [-190,120,-400], [-40,115,-400], [110,90,-400], [120,100,-400], [-90,130,-400], [-140,120,-400],
            [10,100,-400], [140,240,-400], [-140,105,-400], [400,90,70], [400,150,50], [400,120,-190], [400,160,-40],
            [400,100,110], [400,200,120], [400,110,-140], [400,230,10], [400,110,-500], [400,205,-140], [300,90,300],
            [380,120,250], [220,135,250], [220,150,250], [220,250,250], [200,100,250], [250,250,250], [300,90,-300],
            [380,120,-250], [220,135,-250], [220,150,-250], [220,250,-250], [200,100,-250], [250,250,-250],
            [-300,90,-300], [-380,90,-250], [-220,90,-250], [-220,150,-250], [-220,250,-250], [-200,150,-250],
            [-250,250,-250], [-400,90,70], [-400,150,50], [-400,120,-190], [-400,160,-40], [-400,140,110],
            [-400,200,120], [-400,100,-90], [-400,110,-140], [-400,230,10], [-400,100,140], [-400,200,-500],
            [-400,210,-140], [-300,90,300], [-380,120,250], [-220,135,250], [-220,150,250], [-220,250,250],
            [-200,100,250], [-250,250,250],
        ];
        let star_trans = Mat4.identity();
        for(var i = 0; i < starTuples.length; i++) {
            this.shapes.sphere.draw(context, program_state, star_trans.times(Mat4.translation(starTuples[i][0],
                starTuples[i][1], starTuples[i][2])), this.materials.star);
        }

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
        const white = hex_color("#ef0505");

        const sun_yellow = hex_color("#feff05");
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

        // Day and night cycle calculations
        let day_night_sequence = this.day_night_sequence(context, program_state, t,dt);

        // The parameters of the Light are: position, color, size
        program_state.lights = [

            new Light(day_night_sequence.light_position, sun_yellow, day_night_sequence.radius),
            //courtyard Lights
            new Light(vec4(5.2, 5, 5.2, 1), yellow, this.lights_size),
            new Light(vec4(7.5, 5, 5.2, 1), yellow, this.lights_size),
            new Light(vec4(5.2, 5, -16.2, 1), yellow, this.lights_size),
            new Light(vec4(7.5, 5, -16.2, 1), yellow, this.lights_size),
            new Light(vec4(13.2, 5, -11.2, 1), yellow, this.lights_size),
            new Light(vec4(13.2, 5, 0.2, 1), yellow, this.lights_size),
            new Light(vec4(-0.45, 5, -11.2, 1), yellow, this.lights_size),
            new Light(vec4(-0.45, 5, 0.2, 1), yellow, this.lights_size),
            new Light(vec4(-17.2, 5, -11.2, 1), yellow, this.lights_size),
            new Light(vec4(-17.2, 5, 0.2, 1), yellow, this.lights_size),
            new Light(vec4(-5.2, 5, 5.2, 1), yellow, this.lights_size),
            new Light(vec4(-12.5, 5, 5.2, 1), yellow, this.lights_size),
            new Light(vec4(-5.2, 5, -15.2, 1), yellow, this.lights_size),
            new Light(vec4(-12.5, 5, -15.2, 1), yellow, this.lights_size),
            //Hollywood Lights
            new Light(vec4(-215, 30, 22, 1), yellow, 1000),
            new Light(vec4(-215, 34, -7, 1), yellow, 1000),
            new Light(vec4(-215, 30, -25, 1), yellow, 1000),
            new Light(vec4(-200, 35, -45, 1), yellow, 1000),

        ];

        // create day and night sequence
        if(this.sun.sun_rise) {
            this.shapes.sun.draw(context, program_state, this.sun.transform,
                this.materials.sun);
        }

        //Draw the ground and sky
        this.shapes.square.draw(context, program_state, Mat4.translation(0, -10, 0)
            .times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(1000, 1000, 1)), this.materials.grass);
        this.shapes.sphere.draw(context, program_state, Mat4.scale(500, 500, 500), this.materials.sky.override({color: day_night_sequence.sky_color}));

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

        this.display_Entry_bushes(context,program_state);
        this.display_Side_bushes(context, program_state);
        this.displayStars(context, program_state);



        //Create a hill
        let hill_transform = Mat4.identity().times(Mat4.translation(0, -10, 0)).times(Mat4.scale(70, 13, 70));
        this.shapes.sphere.draw(context, program_state, hill_transform, this.materials.dark_grass);

        this.display_HollywoodSign(context,program_state);

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

        this.display_city(context, program_state);
    }
}