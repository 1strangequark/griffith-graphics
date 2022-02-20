import {defs, tiny} from './examples/common.js';

const {vec3, unsafe3, vec4, color, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;

const drop_size = 0.08;

export class Body {
    constructor(shape, material, size) {
        Object.assign(this,
            {shape, material, size})
    }

    emplace(location_matrix, linear_velocity, angular_velocity, spin_axis = vec3(0, 0, 0).randomized(1).normalized()) {
        this.center = location_matrix.times(vec4(0, 0, 0, 1)).to3();
        this.post_impact_time = 0;
        this.rotation = Mat4.translation(...this.center.times(-1)).times(location_matrix);
        this.previous = {center: this.center.copy(), rotation: this.rotation.copy()};
        this.drawn_location = location_matrix;
        this.temp_matrix = Mat4.identity();
        return Object.assign(this, {linear_velocity, angular_velocity, spin_axis})
    }

    advance(time_amount) {
        this.previous = {center: this.center.copy(), rotation: this.rotation.copy()};
        this.center = this.center.plus(this.linear_velocity.times(time_amount));
        this.rotation.pre_multiply(Mat4.rotation(time_amount * this.angular_velocity, ...this.spin_axis));
    }

    blend_rotation(alpha) {
        return this.rotation.map((x, i) => vec4(...this.previous.rotation[i]).mix(x, alpha));
    }

    blend_state(alpha) {
        this.drawn_location = Mat4.translation(...this.previous.center.mix(this.center, alpha))
            .times(this.blend_rotation(alpha))
            .times(Mat4.scale(...this.size))
            .times(Mat4.scale(drop_size, drop_size, drop_size));
    }

    check_if_colliding(b, collider) {
        if (this == b)
            return false;
        const T = this.inverse.times(b.drawn_location, this.temp_matrix);

        const {intersect_test, points, leeway} = collider;
        // For each vertex in that b, shift to the coordinate frame of
        // a_inv*b.  Check if in that coordinate frame it penetrates
        // the unit sphere at the origin.  Leave some leeway.
        return points.arrays.position.some(p =>
            intersect_test(T.times(p.to4(1)).to3(), leeway));
    }
}


export class Simulation extends Scene {
    // **Simulation** manages the stepping of simulation time.  Subclass it when making
    // a Scene that is a physics demo.  This technique is careful to totally decouple
    // the simulation from the frame rate (see below).
    constructor() {
        super();
        Object.assign(this, {time_accumulator: 0, time_scale: 1, rain_enabled: true, t: 0, dt: 1 / 20, bodies: [], steps_taken: 0});
    }

    get rainEnabled() {
        return this.rain_enabled;
    }
    simulate(frame_time) {
        frame_time = this.time_scale * frame_time;
        this.time_accumulator += Math.min(frame_time, 0.1);
        while (Math.abs(this.time_accumulator) >= this.dt) {
            this.update_state(this.dt);
            for (let b of this.bodies)
                b.advance(this.dt);
            this.t += Math.sign(frame_time) * this.dt;
            this.time_accumulator -= Math.sign(frame_time) * this.dt;
            this.steps_taken++;
        }
        let alpha = this.time_accumulator / this.dt;
        for (let b of this.bodies) b.blend_state(alpha);
    }

    make_control_panel() {
        this.key_triggered_button("Toggle Rain", ["t"], () => this.rain_enabled = !this.rain_enabled);
        this.key_triggered_button("Speed up time", ["Shift", "T"], () => this.time_scale *= 2);
        this.key_triggered_button("Slow down time", ["t"], () => this.time_scale /= 2);
        this.new_line();
        this.live_string(box => {
            box.textContent = "Time scale: " + this.time_scale
        });
        this.new_line();
        this.live_string(box => {
            box.textContent = "Fixed simulation time step size: " + this.dt
        });
        this.new_line();
        this.live_string(box => {
            box.textContent = this.steps_taken + " timesteps were taken so far."
        });
    }

    display(context, program_state) {
        if (program_state.animate)
            this.simulate(program_state.animation_delta_time);
        for (let b of this.bodies)
            b.shape.draw(context, program_state, b.drawn_location, b.material);
    }

    update_state(dt) {
        throw "Override this"
    }
}

export class Test_Data {
    constructor() {
        this.textures = {
            rgb: new Texture("assets/rgb.jpg"),
            earth: new Texture("assets/earth.gif"),
            grid: new Texture("assets/grid.png"),
            stars: new Texture("assets/stars.png"),
            text: new Texture("assets/text.png"),
        }
        this.shapes = {
            ball: new defs.Subdivision_Sphere(1, [[0, 3], [0, 3]]),
        };
    }

    get_droplet(shape_list = this.shapes) {
        const shape_names = Object.keys(shape_list);
        return shape_list[shape_names[~~(shape_names.length * Math.random())]]
    }
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

export class Rain extends Simulation {
    constructor() {
        super();
        this.data = new Test_Data();
        this.shapes = Object.assign({}, this.data.shapes);
        this.shapes.square = new defs.Square();
        const shader = new defs.Fake_Bump_Map(1);
        this.material = new Material(shader, {
            color: color(0.6, 0.7, 1, 1),
            ambient: 0, texture: this.data.textures.stars
        })
    }

    update_state(dt) {
        console.log(dt);

        if(super.rainEnabled) {
            while (this.bodies.length < 1000)
                this.bodies.push(new Body(this.data.get_droplet(), this.material, vec3(1, 1 + Math.random(), 1))
                    .emplace(Mat4.translation(...vec3(randomRange(-50, 50), 30, randomRange(-50, 50)).randomized(20)),
                        vec3(0, -1, 0).randomized(2).normalized().times(3), Math.random()));
        }
        for (let b of this.bodies) {
            // Gravity on Earth, where 1 unit in world space = 1 meter:
            b.linear_velocity[1] += dt * -9.8;
            // If about to fall through floor, reverse y velocity:
            if (b.center[1] < -8 && b.linear_velocity[1] < 0) {
                b.linear_velocity[1] *= -.2;
                b.post_impact_time += dt;
            }
        }
        // Delete bodies that stop or stray too far away:
        this.bodies = this.bodies.filter(b => b.center.norm() < 150 && b.linear_velocity.norm() > 3 && b.post_impact_time < 1);
    }

    display(context, program_state) {
        // display(): Draw everything else in the scene besides the moving bodies.
        super.display(context, program_state);

        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            this.children.push(new defs.Program_State_Viewer());
        }
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 500);
        program_state.lights = [new Light(vec4(0, -5, -10, 1), color(1, 1, 1, 1), 100000)];
    }
}