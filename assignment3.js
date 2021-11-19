//

import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Assignment3 extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.member_model = Mat4.identity();
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            torus: new defs.Torus(15, 15),
            torus2: new defs.Torus(3, 15),
            sphere: new defs.Subdivision_Sphere(4),
            circle: new defs.Regular_2D_Polygon(1, 15),
            // TODO:  Fill in as many additional shape instances as needed in this key/value table.
            //        (Requirement 1)
            sphere1: new ( defs.Subdivision_Sphere.prototype.make_flat_shaded_version() )(1),
            sphere2: new ( defs.Subdivision_Sphere.prototype.make_flat_shaded_version() )(2),
            sphere3: new defs.Subdivision_Sphere(3),

            sun: new defs.Subdivision_Sphere(4),
            
            player_head: new defs.Subdivision_Sphere(4),
            player_torso: new defs.Cube(),
            player_left_arm: new defs.Cube(),
            player_right_arm: new defs.Cube(),
            player_left_leg: new defs.Cube(),
            player_right_leg: new defs.Cube(),
        };

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            test2: new Material(new Gouraud_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#992828")}),
            ring: new Material(new Ring_Shader()),

            player: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: 0.6, color: hex_color("#2774AE")}),


        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));

        this.player_x = 0;
        this.player_y = 0;
        this.player_z = 0;
        
        this.real_x = 0;
        this.real_y = 0;
        this.real_z = 0;

        this.y_vel = 0;
        this.y_accel = 0;

        this.down_pressed = false;

        this.frames = 0;

        this.unpaused_time = 0;
        this.is_paused = false;

        this.left_cooldown_time = 0;
        this.right_cooldown_time = 0;
    }

    jump() {
        if (this.player_y == 0 && !this.is_paused)
            this.y_vel = 0.916/2;
    }

    shift_left() {
        if (!this.is_paused && this.left_cooldown_time == 0) {
            this.player_x  = Math.max(this.player_x - 10, -10);
            this.left_cooldown_time = 1/6;
            this.right_cooldown_time = 0;
        }
    }

    shift_right() {
        if (!this.is_paused && this.right_cooldown_time == 0) {
            this.player_x = Math.min(this.player_x + 10, 10);
            this.left_cooldown_time = 0;
            this.right_cooldown_time = 1/6;
        }
    }

    begin_crouch() {
        if (!this.is_paused)
            this.down_pressed = true;
    }

    end_crouch() {
        if (!this.is_paused)
            this.down_pressed = false;
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Move Left", ["ArrowLeft"], () => this.shift_left());
        this.key_triggered_button("Move Right", ["ArrowRight"], () => this.shift_right());
        this.new_line();
        this.key_triggered_button("Jump", ["ArrowUp"], () => this.jump());
        this.key_triggered_button("Crouch", ["ArrowDown"], () => this.begin_crouch(), '#6E6460', () => this.end_crouch());
        this.new_line();
        this.key_triggered_button("Pause", ["c"], () => this.is_paused = !this.is_paused);
    }
    /*
    key_triggered_button(description, shortcut_combination, callback, color = '#6E6460',
                                release_event, recipient = this, parent = this.control_panel)
    */


    display(context, program_state) {

        //diagnostics

        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);


        let delta_time_seconds = program_state.animation_delta_time / 1000;

        if (!this.is_paused) {
            this.unpaused_time += delta_time_seconds;
        }

        let time_seconds = this.unpaused_time;

        // this.shapes.[XXX].draw([XXX]) // <--example
        //const light_position = vec4(0, 5, 5, 1);
        // The parameters of the Light are: position, color, size
        //program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
        
        // model_transform = model_transform.times(Mat4.rotation(angle,0,0,1)); // rotates around x,y,z ax

        // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 3 and 4)
        // const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        /*
        
        */
        //this.member_model = Mat4.identity();
        //this.member_model = this.member_model.times(Mat4.translation(this.player_x, this.player_y, this.player_z));


        
        if (!this.is_paused) {

            this.left_cooldown_time = Math.max(this.left_cooldown_time - delta_time_seconds, 0);
            this.right_cooldown_time = Math.max(this.right_cooldown_time - delta_time_seconds, 0);

            ///
            /// X axis movement
            ///
            if(this.real_x < this.player_x)
            {
                let translation_distance = Math.min(this.real_x + delta_time_seconds * 60, this.player_x) - this.real_x;
                this.member_model = this.member_model.times(Mat4.translation(translation_distance, 0, 0));
                this.real_x += translation_distance;
            }
            if(this.real_x > this.player_x)
            {
                let translation_distance = Math.max(this.real_x - delta_time_seconds * 60, this.player_x) - this.real_x;
                this.member_model = this.member_model.times(Mat4.translation(translation_distance, 0, 0));
                this.real_x += translation_distance;
            }


            ///
            /// Y axis movement
            ///

            if (this.down_pressed)
                this.y_accel = -0.077 * 2;
            else
                this.y_accel = -0.077/4;
            this.y_vel = this.y_vel + this.y_accel;
            let y_new = Math.max(this.player_y + this.y_vel, 0);
            if (y_new == 0)
                this.y_vel = 0;
            let delta_y = y_new - this.player_y;
            this.member_model = this.member_model.times(Mat4.translation(0, delta_y, 0));
            this.player_y = y_new;

        }

        
        let object_model_transform = Mat4.identity();

        let player_model_transform = this.member_model;

        const light_position = vec4(0, 0, 10, 1);
        const white = color(1,1,1,1);
        program_state.lights = [new Light(light_position, white, 1000)];
        // Rohans Testing stuff:
        //
        // model_transform = model_transform.times(Mat4.rotation(angle,0,0,1)); // rotates around x,y,z ax
        // model_transform = model_transform.times(Mat4.translation(-delx,dely,0));
      
        // PLAYER DIMENSIONS:
        // Head: r = 1.25. center of the head is at the origin.
        // Torso: x = 2, y = 3, z = 1
        // Limbs: x = 1, y = 3, z = 1
        // Mat4.scale(x/2, y/2, z/2), because each "unit" cube is 2x2x2
        

        this.frames += 1;

        if(time_seconds % 2 < 1)
        {
            this.frames/=2
            console.log("Frames Per Second: " + this.frames);
            this.frames = 0;
        }






        let animation_speed = 3;

        if(time_seconds > 20)
            animation_speed = 6;

        let limb_rotation = Math.PI / 6 * Math.sin(time_seconds * animation_speed * Math.PI);
        let is_crouching = this.down_pressed && (this.player_y == 0);

        let player_head_mat = player_model_transform;
        if (is_crouching) {
            player_head_mat = player_head_mat.times(Mat4.translation(0, -4.25, 0));
            player_head_mat = player_head_mat.times(Mat4.rotation(-1 * Math.PI / 2, 1, 0, 0));
            player_head_mat = player_head_mat.times(Mat4.translation(0, 4.25, 0));
        }
        player_head_mat = player_head_mat.times(Mat4.scale(1.25, 1.25, 1.25));
        this.shapes.player_head.draw(context, program_state, player_head_mat, this.materials.player);

        let player_torso_mat = player_model_transform;
        player_torso_mat = player_torso_mat.times(Mat4.translation(0, -2.75, 0));
        if (is_crouching) {
            player_torso_mat = player_torso_mat.times(Mat4.translation(0, -1.5, 0));
            player_torso_mat = player_torso_mat.times(Mat4.rotation(-1 * Math.PI / 2, 1, 0, 0));
            player_torso_mat = player_torso_mat.times(Mat4.translation(0, 1.5, 0));
        }
        player_torso_mat = player_torso_mat.times(Mat4.scale(1, 1.5, 0.5));
        this.shapes.player_torso.draw(context, program_state, player_torso_mat, this.materials.player);

        let player_left_arm_mat = player_model_transform;
        player_left_arm_mat = player_left_arm_mat.times(Mat4.translation(-1.5, -2.75, 0));
        if (is_crouching) {
            player_left_arm_mat = player_left_arm_mat.times(Mat4.translation(0, -1.5, 0));
            player_left_arm_mat = player_left_arm_mat.times(Mat4.rotation(-1 * Math.PI / 2, 1, 0, 0));
            player_left_arm_mat = player_left_arm_mat.times(Mat4.translation(0, 1.5, 0));
        }
        player_left_arm_mat = player_left_arm_mat.times(Mat4.translation(0.5, 1.5, 0));
        player_left_arm_mat = player_left_arm_mat.times(Mat4.rotation(Math.PI / 48.0 * (-1), 0, 0, 1));
        if ((this.player_y == 0) && !is_crouching)
            player_left_arm_mat = player_left_arm_mat.times(Mat4.rotation(limb_rotation, 1, 0, 0));
        player_left_arm_mat = player_left_arm_mat.times(Mat4.translation(-0.5, -1.5, 0));
        player_left_arm_mat = player_left_arm_mat.times(Mat4.scale(0.5, 1.5, 0.5));
        this.shapes.player_left_arm.draw(context, program_state, player_left_arm_mat, this.materials.player);

        let player_right_arm_mat = player_model_transform;
        player_right_arm_mat = player_right_arm_mat.times(Mat4.translation(1.5, -2.75, 0));
        if (is_crouching) {
            player_right_arm_mat = player_right_arm_mat.times(Mat4.translation(0, -1.5, 0));
            player_right_arm_mat = player_right_arm_mat.times(Mat4.rotation(-1 * Math.PI / 2, 1, 0, 0));
            player_right_arm_mat = player_right_arm_mat.times(Mat4.translation(0, 1.5, 0));
        }
        player_right_arm_mat = player_right_arm_mat.times(Mat4.translation(-0.5, 1.5, 0));
        player_right_arm_mat = player_right_arm_mat.times(Mat4.rotation(Math.PI / 48.0, 0, 0, 1));
        if ((this.player_y == 0) && !is_crouching)
            player_right_arm_mat = player_right_arm_mat.times(Mat4.rotation(-1 * limb_rotation, 1, 0, 0));
        player_right_arm_mat = player_right_arm_mat.times(Mat4.translation(0.5, -1.5, 0));
        player_right_arm_mat = player_right_arm_mat.times(Mat4.scale(0.5, 1.5, 0.5));
        this.shapes.player_right_arm.draw(context, program_state, player_right_arm_mat, this.materials.player);

        let player_left_leg_mat = player_model_transform;
        player_left_leg_mat = player_left_leg_mat.times(Mat4.translation(0, -4.25, 0));
        player_left_leg_mat = player_left_leg_mat.times(Mat4.rotation(Math.PI / 192.0 * (-1), 0, 0, 1));
        if (this.player_y == 0)
            player_left_leg_mat = player_left_leg_mat.times(Mat4.rotation(-1 * limb_rotation, 1, 0, 0));
        player_left_leg_mat = player_left_leg_mat.times(Mat4.translation(-0.5, -1.5, 0));
        player_left_leg_mat = player_left_leg_mat.times(Mat4.scale(0.5, 1.5, 0.5));
        this.shapes.player_left_leg.draw(context, program_state, player_left_leg_mat, this.materials.player);

        let player_right_leg_mat = player_model_transform;
        player_right_leg_mat = player_right_leg_mat.times(Mat4.translation(0, -4.25, 0));
        player_right_leg_mat = player_right_leg_mat.times(Mat4.rotation(Math.PI / 192.0, 0, 0, 1));
        if (this.player_y == 0)
            player_right_leg_mat = player_right_leg_mat.times(Mat4.rotation(limb_rotation, 1, 0, 0));
        player_right_leg_mat = player_right_leg_mat.times(Mat4.translation(0.5, -1.5, 0));
        player_right_leg_mat = player_right_leg_mat.times(Mat4.scale(0.5, 1.5, 0.5));
        this.shapes.player_right_leg.draw(context, program_state, player_right_leg_mat, this.materials.player);

        object_model_transform = object_model_transform.times(Mat4.translation(10, 1, -10));
        this.shapes.player_head.draw(context, program_state, object_model_transform, this.materials.player.override({color: hex_color("FF0000")}));

        /*
        if(this.attached)
        {
            const desired = Mat4.inverse(this.attached().times(Mat4.translation(0, 0, 10)));
            const blending_factor = .05;
            const cur_view = desired.map((x, i) => Vector.from(program_state.camera_inverse[i]).mix(x, blending_factor));

            program_state.set_camera(cur_view);

        }
        
        */
        /*
        model_transform = model_transform.times(Mat4.translation(3,0,0));
        if(t %2 <1)
            this.shapes.sphere.draw(context, program_state, model_transform, this.materials.planet2o.override({color: red}));
        else
            this.shapes.sphere.draw(context, program_state, model_transform, this.materials.planet2e.override({color: red}));

        model_transform = model_transform.times(Mat4.translation(3,0,0));
        this.shapes.sphere.draw(context, program_state, model_transform, this.materials.planet2e.override({color: red}));
        */
    }
}

class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl code here to create a Gouraud Shader (Planet 2)

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

        varying vec4 VERTEX_COLOR;
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
                
                vec4 color = vec4( shape_color.xyz * ambient, shape_color.w );
                color.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
                VERTEX_COLOR = color;
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           
                // Compute an initial (ambient) color:
                //gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                // Compute the final color with contributions from lights:
                //gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
                gl_FragColor = VERTEX_COLOR;
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
        varying vec4 vertex_color;
        uniform vec3 squared_scale;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        attribute vec3 position, normal;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
            //the vertex's final resting place (in NDCS)
          //gl_Position = projection_camera_model_transform * vec4( position, 1.0);
          //vec3 normal_worldspace = normalize(mat3( model_transform) * normal / squared_scale);
          //vec3 vertex_worldspace = (model_transform * vec4(position, 1.0)).xyz;
          //vertex_color = color_based_on_normal(normal_worldspace, vertex_worldspace);

        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        void main(){
          gl_FragColor = vec4( vertex_color.xyz, 1.0);
        }`;
    }
}

