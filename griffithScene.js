import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;
const SPEED_UP = 1;
const SLOW_DOWN = -1;

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
            sun: new defs.Subdivision_Sphere(4),

        // TODO:  Fill in as many additional shape instances as needed in this key/value table.
            //        (Requirement 1)
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
            sun:  new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0,color: hex_color("#feff05")}),
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
        this.sun.track_transition =0;
        this.sun.day_night_interval = 0;
        this.sun.max_day_night_interval = 0;
        this.sun.theta =  Math.PI / this.sun.day_night_period;
        let identity = Mat4.identity();
        this.sun.transform = identity.times(Mat4.translation(200,5,215)).times(Mat4.scale(5,5,5));
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
        this.key_triggered_button("Orbit", ["Control", "0"], () => this.setCameraActivity("Orbit"));
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
        const sun_yellow = hex_color("#feff05");
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

        // Day and night cycle calculations
        let day_night_sequence = this.day_night_sequence(context, program_state, t,dt);

        // The parameters of the Light are: position, color, size
        program_state.lights = [
            new Light(day_night_sequence.light_position, sun_yellow, day_night_sequence.radius),
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

class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template

    constructor(num_lights = 20) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        // ***** PHONG SHADING HAPPENS HERE: *****
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the
                // light will appear directional (uniform direction from all points), and we
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to
                // the point light's location from the current surface point.  In either case,
                // fade (attenuate) the light as the vector needed to reach it gets longer.
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz -
                                               light_positions_or_vectors[i].w * vertex_worldspace;
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;
            // Position is expressed in object coordinates.

            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;

            void main(){
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){
                // Compute an initial (ambient) color:
                gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;

        void main(){

        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        return this.shared_glsl_code() + `
        void main(){

        }`;
    }
}
