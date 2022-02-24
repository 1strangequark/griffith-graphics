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
            torus: new defs.Torus(15, 15),
            torus2: new defs.Torus(3, 15),
            sphere: new defs.Subdivision_Sphere(5),
            capped_cylinder: new defs.Capped_Cylinder(5, 5, [[0, 2], [0, 1]]),
            circle: new defs.Regular_2D_Polygon(1, 30),
            cube: new defs.Cube(),
            square: new defs.Square(),
            triangle: new defs.Triangle(),
            axes: new defs.Axis_Arrows(),
            cylinder: new defs.Cylindrical_Tube(15, 15),
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            test2: new Material(new Gouraud_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#992828")}),
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
        let building_ornament_transform = Mat4.identity().times(Mat4.scale(100, 100, 100)).times(Mat4.translation(0, 4.5, 21));
        this.shapes.capped_cylinder.draw(context, program_state, building_ornament_transform, this.materials.observatory_roof);
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

class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as templated

    constructor(num_lights = 2) {
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

