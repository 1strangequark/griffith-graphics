import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class GriffithScene extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

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
            moon: new defs.Subdivision_Sphere(4),

        // TODO:  Fill in as many additional shape instances as needed in this key/value table.
            //        (Requirement 1)
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .5, diffusivity: .6, color: hex_color("#ffffff")}),
            test2: new Material(new Gouraud_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#992828")}),
            grass: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0, color: hex_color("#466d46")}),
            dark_grass: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0, color: hex_color("#2f5128")}),
            light_grass: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0, color: hex_color("#4d7c32")}),
            tree_leaves: new Material(new Gouraud_Shader(),
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
                {ambient: 1, diffusivity: 1.0, specularity: 0,color: hex_color("#fcba03")}),
            moon: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1.0, specularity: 0,color: hex_color("#ffffff")}),
        }

        this.initial_camera_location = Mat4.look_at(vec3(-35, 13, -20), vec3(0, 5, 25), vec3(0, 1, 0));
        this.sun_rise = true;
        this.day_night_interval = 0;
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Example Command Name", ["Control", "0"], () => this.attached = () => null);
        this.new_line();
    }

    day_night_sequence(context, program_state, t,dt, period = 20) {
        // period is the duration of day or night
        // i.e. period of 10 => sun cycle lasts 10 seconds and moon cycle lasts 10 seconds
        let theta = 2 * Math.PI / period;
        let cameraY = program_state.camera_inverse[1][3];
        //console.log(cameraY);
        // console.log(program_state);
        this.day_night_interval += dt;
        if(this.day_night_interval >= period - 0.5) {
            this.day_night_interval = 0;
            this.sun_rise = !this.sun_rise;
        }

        let transform = Mat4.identity();
        let x = 200 + 200 * Math.cos(theta* this.day_night_interval);
        let y =   5 + 200 * Math.sin(theta* this.day_night_interval );
        let z_1 = 215 + 190*Math.sin(theta*this.day_night_interval/2);

        if(this.sun_rise){
            // simulate daylight
            transform = transform.times(Mat4.translation(x,y,z_1)).times(Mat4.scale(5,5,5));
            this.shapes.sun.draw(context, program_state, transform, this.materials.sun);
        } else {
            // simulate nighttime
            transform = transform.times(Mat4.translation(x,y,z_1)).times(Mat4.scale(5,5,5));
            this.shapes.moon.draw(context, program_state, transform, this.materials.moon);

        }
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
        console.log("t:" +t);console.log("dt:" +dt);


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
        
        // create day and night sequence
        this.day_night_sequence(context, program_state, t,dt);

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
