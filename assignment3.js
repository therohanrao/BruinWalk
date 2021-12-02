//
// pog
import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

const {Textured_Phong} = defs

export class Text_Line extends Shape {                           // **Text_Line** embeds text in the 3D world, using a crude texture
                                                                 // method.  This Shape is made of a horizontal arrangement of quads.
                                                                 // Each is textured over with images of ASCII characters, spelling
                                                                 // out a string.  Usage:  Instantiate the Shape with the desired
                                                                 // character line width.  Then assign it a single-line string by calling
                                                                 // set_string("your string") on it. Draw the shape on a material
                                                                 // with full ambient weight, and text.png assigned as its texture
                                                                 // file.  For multi-line strings, repeat this process and draw with
                                                                 // a different matrix.
    constructor(max_size) {
        super("position", "normal", "texture_coord");
        this.max_size = max_size;
        var object_transform = Mat4.identity();
        for (var i = 0; i < max_size; i++) {                                       // Each quad is a separate Square instance:
            defs.Square.insert_transformed_copy_into(this, [], object_transform);
            object_transform.post_multiply(Mat4.translation(1.5, 0, 0));
        }
    }

    set_string(line, context) {           // set_string():  Call this to overwrite the texture coordinates buffer with new
        // values per quad, which enclose each of the string's characters.
        this.arrays.texture_coord = [];
        for (var i = 0; i < this.max_size; i++) {
            var row = Math.floor((i < line.length ? line.charCodeAt(i) : ' '.charCodeAt()) / 16),
                col = Math.floor((i < line.length ? line.charCodeAt(i) : ' '.charCodeAt()) % 16);

            var skip = 3, size = 32, sizefloor = size - skip;
            var dim = size * 16,
                left = (col * size + skip) / dim, top = (row * size + skip) / dim,
                right = (col * size + sizefloor) / dim, bottom = (row * size + sizefloor + 5) / dim;

            this.arrays.texture_coord.push(...Vector.cast([left, 1 - bottom], [right, 1 - bottom],
                [left, 1 - top], [right, 1 - top]));
        }
        if (!this.existing) {
            this.copy_onto_graphics_card(context);
            this.existing = true;
        } else
            this.copy_onto_graphics_card(context, ["texture_coord"], false);
    }
}

class Cloud {
    constructor(x, y, z, x_size, z_size, scene) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.x_size = x_size;
        this.z_size = z_size;
        this.scene = scene;
    }

    advance(distance) {
        this.z += distance;
    }

    draw (context, program_state, cloud_color) {
        let cloud_mat = Mat4.identity();
        cloud_mat = cloud_mat.times(Mat4.translation(this.x, this.y, this.z));
        cloud_mat = cloud_mat.times(Mat4.scale(this.x_size, 0.05, this.z_size));
        this.scene.shapes.cloud.draw(context, program_state, cloud_mat, this.scene.materials.cloud.override({color: cloud_color}));
    }
}

class Obstacle {
    constructor(x, y, z, scene) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.scene = scene;
    }

    advance(distance) {
        this.z += distance;
    }
}

class Andre extends Obstacle {
    constructor(x, y, z, scene) {
        super(x, y, z, scene);
    }

    draw(context, program_state) {
        let andre_head_mat = Mat4.identity();
        andre_head_mat = andre_head_mat.times(Mat4.translation(this.x, this.y, this.z));
        andre_head_mat = andre_head_mat.times(Mat4.scale(1.25, 1.25, 1.25));
        this.scene.shapes.andre_head.draw(context, program_state, andre_head_mat, this.scene.materials.andre);

        let andre_torso_mat = Mat4.identity();
        andre_torso_mat = andre_torso_mat.times(Mat4.translation(this.x, this.y - 2.75, this.z));
        andre_torso_mat = andre_torso_mat.times(Mat4.scale(1, 1.5, 0.5));
        this.scene.shapes.andre_torso.draw(context, program_state, andre_torso_mat, this.scene.materials.andre);

        let andre_left_arm_mat = Mat4.identity();
        andre_left_arm_mat = andre_left_arm_mat.times(Mat4.translation(this.x - 1.0, this.y - 1.25, this.z));
        andre_left_arm_mat = andre_left_arm_mat.times(Mat4.rotation(Math.PI / 48.0 * (-1), 0, 0, 1));
        andre_left_arm_mat = andre_left_arm_mat.times(Mat4.translation(-0.5, -1.5, 0));
        andre_left_arm_mat = andre_left_arm_mat.times(Mat4.scale(0.5, 1.5, 0.5));
        this.scene.shapes.andre_left_arm.draw(context, program_state, andre_left_arm_mat, this.scene.materials.andre);

        let andre_right_arm_mat = Mat4.identity();
        andre_right_arm_mat = andre_right_arm_mat.times(Mat4.translation(this.x + 1.0, this.y - 1.25, this.z));
        andre_right_arm_mat = andre_right_arm_mat.times(Mat4.rotation(Math.PI / 48.0, 0, 0, 1));
        andre_right_arm_mat = andre_right_arm_mat.times(Mat4.translation(0.5, -1.5, 0));
        andre_right_arm_mat = andre_right_arm_mat.times(Mat4.scale(0.5, 1.5, 0.5));
        this.scene.shapes.andre_right_arm.draw(context, program_state, andre_right_arm_mat, this.scene.materials.andre);

        let andre_left_leg_mat = Mat4.identity();
        andre_left_leg_mat = andre_left_leg_mat.times(Mat4.translation(this.x, this.y - 4.25, this.z));
        andre_left_leg_mat = andre_left_leg_mat.times(Mat4.rotation(Math.PI / 192.0 * (-1), 0, 0, 1));
        andre_left_leg_mat = andre_left_leg_mat.times(Mat4.translation(-0.5, -1.5, 0));
        andre_left_leg_mat = andre_left_leg_mat.times(Mat4.scale(0.5, 1.5, 0.5));
        this.scene.shapes.andre_left_leg.draw(context, program_state, andre_left_leg_mat, this.scene.materials.andre);

        let andre_right_leg_mat = Mat4.identity();
        andre_right_leg_mat = andre_right_leg_mat.times(Mat4.translation(this.x, this.y - 4.25, this.z));
        andre_right_leg_mat = andre_right_leg_mat.times(Mat4.rotation(Math.PI / 192.0, 0, 0, 1));
        andre_right_leg_mat = andre_right_leg_mat.times(Mat4.translation(0.5, -1.5, 0));
        andre_right_leg_mat = andre_right_leg_mat.times(Mat4.scale(0.5, 1.5, 0.5));
        this.scene.shapes.andre_right_leg.draw(context, program_state, andre_right_leg_mat, this.scene.materials.andre);
    }

    check_collision(p_x, p_y, p_z, p_crouch) {
        
        let andre_x = this.x;
        let andre_z = this.z;
        let andre_head_center_y = this.y;
        let andre_torso_center_y = this.y - 2.75;
        //let andre_leg_center_y = this.y - 5.75;

        let player_x = p_x;
        let player_z = p_z; 
        let player_head_center_y = p_y;
        let player_torso_center_y = p_y - 2.75;
        let player_leg_center_y = p_y - 5.75;
        
        if(p_crouch){
            let head_center_z = -4.25
            if (Math.abs(player_x - andre_x) <= (1.25+2) && Math.abs(head_center_z - andre_z) <= (1.25+0.5)) {
                return true;
            }
        }

        //player non crouching
        //collision with player's head
        //player head with andre head
        if(Math.abs(player_x - andre_x) <= 2.5 && Math.abs(player_z - andre_z) <= 2.5
            && Math.abs(player_head_center_y - andre_head_center_y) <= 2.5){
            return true;
        }
        
        //collision with player's torso
        //player torso with andre head
        if(Math.abs(player_x - andre_x) <= (2+1.25) && Math.abs(player_z - andre_z) <= (0.5+0.5)
            && Math.abs(player_torso_center_y - andre_head_center_y) <= (1.5+1.25)){
            return true;
        }
        //player torso with andre torso
        if(Math.abs(player_x - andre_x) <= (2+2) && Math.abs(player_z - andre_z) <= (0.5+0.5)
        && Math.abs(player_torso_center_y - andre_torso_center_y) <= (1.5+1.5)){
        return true;
        }
        
        //collision with player's legs
        //player legs with andre head
        if(Math.abs(player_x - andre_x) <= (1+1.25) && Math.abs(player_z - andre_z) <= (0.5+1.25)
            && Math.abs(player_leg_center_y - andre_head_center_y) <= (1.5+1.25)){
            return true;
        }
        
        return false;
    }
}

class Table extends Obstacle {
    constructor(x, y, z, scene) {
        super(x, y, z, scene);
    }

    draw(context, program_state) {
        let table_top_mat = Mat4.identity();
        table_top_mat = table_top_mat.times(Mat4.translation(this.x, this.y - 4.56, this.z));
        table_top_mat = table_top_mat.times(Mat4.scale(15, 0.14, 2.27));
        this.scene.shapes.table_top.draw(context, program_state, table_top_mat, this.scene.materials.table);
        
        let table_leg_ne_mat = Mat4.identity();
        table_leg_ne_mat = table_leg_ne_mat.times(Mat4.translation(this.x + 14.86, this.y - 7.12, this.z - 2.13));
        table_leg_ne_mat = table_leg_ne_mat.times(Mat4.scale(0.14, 2.42, 0.14));
        this.scene.shapes.table_leg_ne.draw(context, program_state, table_leg_ne_mat, this.scene.materials.table);
        
        let table_leg_se_mat = Mat4.identity();
        table_leg_se_mat = table_leg_se_mat.times(Mat4.translation(this.x + 14.86, this.y - 7.12, this.z + 2.13));
        table_leg_se_mat = table_leg_se_mat.times(Mat4.scale(0.14, 2.42, 0.14));
        this.scene.shapes.table_leg_se.draw(context, program_state, table_leg_se_mat, this.scene.materials.table);
        
        let table_leg_sw_mat = Mat4.identity();
        table_leg_sw_mat = table_leg_sw_mat.times(Mat4.translation(this.x - 14.86, this.y - 7.12, this.z + 2.13));
        table_leg_sw_mat = table_leg_sw_mat.times(Mat4.scale(0.14, 2.42, 0.14));
        this.scene.shapes.table_leg_sw.draw(context, program_state, table_leg_sw_mat, this.scene.materials.table);
        
        let table_leg_nw_mat = Mat4.identity();
        table_leg_nw_mat = table_leg_nw_mat.times(Mat4.translation(this.x - 14.86, this.y - 7.12, this.z - 2.13));
        table_leg_nw_mat = table_leg_nw_mat.times(Mat4.scale(0.14, 2.42, 0.14));
        this.scene.shapes.table_leg_nw.draw(context, program_state, table_leg_nw_mat, this.scene.materials.table);
    }
     // PLAYER DIMENSIONS:
        // Head: r = 1.25. center of the head is at the origin.
        // Torso: x = 2, y = 3, z = 1
        // Limbs: x = 1, y = 3, z = 1
        // Mat4.scale(x/2, y/2, z/2), because each "unit" cube is 2x2x2
    //hit box
    //head
    //player x: -1.25 < x < 1.25
    //player y: -1.25 < y < 1.25
    //player z: -1.25 < z < 1.25
    //mid section
    //player x: -2 < x < 2
    //player y: -1.5 < y < 1.5
    //player z: -0.5 < z < 0.5
    //legs
    //player x: -1 < x < 1
    //player y: -1.5 < y < 1.5
    //player z: -0.5 < z < 0.5

    //Table height: 0.14
    //standing center head to table top: 4.56
    check_collision(p_x, p_y, p_z, p_crouch) {
        // CHECK LEG COLLISON:
        let leg_center_y = p_y - 5.75;
        let leg_center_z = 0;
        let table_center_y = this.y - 4.56;
        let table_center_z = this.z;

        if (Math.abs(leg_center_y - table_center_y) <= 1.64 && Math.abs(leg_center_z - table_center_z) <= 2.77) {
            return true;
        }

        if (p_crouch) {
            // CHECK TORSO COLLISION:
            let torso_center_z = -1.5;
            if (Math.abs(torso_center_z - table_center_z) <= 3.77) {
                return true;
            }

            // CHECK HEAD COLLISION:
            let head_center_z = -4.25
            if (Math.abs(head_center_z - table_center_z) <= 3.5) {
                return true;
            }
        }

        return false;
    }
}

class Banner extends Obstacle {
    constructor(x, y, z, scene, height) {
        super(x, y, z, scene);
        this.height = height;
    }

    draw(context, program_state) {
        if (this.z < 10) {
        let banner_flag_mat = Mat4.identity();
            banner_flag_mat = banner_flag_mat.times(Mat4.translation(this.x, this.y + this.height - 4.83, this.z));
            banner_flag_mat = banner_flag_mat.times(Mat4.scale(15, 2.42, 0.13));
            this.scene.shapes.banner_flag.draw(context, program_state, banner_flag_mat, this.scene.materials.banner_flag);
        }
        
        let banner_left_leg_mat = Mat4.identity();
        banner_left_leg_mat = banner_left_leg_mat.times(Mat4.translation(this.x - 14.86, this.y + this.height / 2.0 - 4.83, this.z));
        banner_left_leg_mat = banner_left_leg_mat.times(Mat4.scale(0.14, this.height / 2.0 + 2.42, 0.14));
        this.scene.shapes.banner_left_leg.draw(context, program_state, banner_left_leg_mat, this.scene.materials.banner_leg);
        
        let banner_right_leg_mat = Mat4.identity();
        banner_right_leg_mat = banner_right_leg_mat.times(Mat4.translation(this.x + 14.86, this.y + this.height / 2.0 - 4.83, this.z));
        banner_right_leg_mat = banner_right_leg_mat.times(Mat4.scale(0.14, this.height / 2.0 + 2.42, 0.14));
        this.scene.shapes.banner_right_leg.draw(context, program_state, banner_right_leg_mat, this.scene.materials.banner_leg);
    }

    check_collision(p_x, p_y, p_z, p_crouch) {
        
        if(p_crouch) {
            return false;
        }
        
        let head_center_y = p_y;
        let head_center_z = p_z;
        let banner_center_y = this.y +this.height - 4.83;
        let banner_center_z = this.z;

        if (Math.abs(head_center_y - banner_center_y) <= (1.25+2.42) && Math.abs(head_center_z - banner_center_z) <= (1.25+0.13)) {
            return true;
        }
        
        return false;
    }
}


export class Assignment3 extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            //text box code:
            cube: new defs.Cube(), 
            text: new Text_Line(35),
            //end text box code
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

            ground: new defs.Cube(),
            off_track: new defs.Cube(),
            sky: new defs.Subdivision_Sphere(4),

            andre_head: new defs.Subdivision_Sphere(4),
            andre_torso: new defs.Cube(),
            andre_left_arm: new defs.Cube(),
            andre_right_arm: new defs.Cube(),
            andre_left_leg: new defs.Cube(),
            andre_right_leg: new defs.Cube(),

            table_top: new defs.Cube(),
            table_leg_ne: new defs.Cube(),
            table_leg_se: new defs.Cube(),
            table_leg_sw: new defs.Cube(),
            table_leg_nw: new defs.Cube(),

            banner_flag: new defs.Cube(),
            banner_left_leg: new defs.Cube(),
            banner_right_leg: new defs.Cube(),

            cloud: new defs.Cube(),
        };

        const phong = new defs.Phong_Shader();
        const texture = new defs.Textured_Phong(1);
        this.grey = new Material(phong, {
            color: color(.5, .5, .5, 1), ambient: 0,
            diffusivity: .3, specularity: .5, smoothness: 10
        })

        // To show text you need a Material like this one:
        this.text_image = new Material(texture, {
            ambient: 1, diffusivity: 0, specularity: 0,
            texture: new Texture("assets/text.png")
        });

        for (let i = 0; i < 24; i++) {
            this.shapes.ground.arrays.texture_coord[i][0] *= 20 / 3;
            this.shapes.ground.arrays.texture_coord[i][1] *= 500;
            this.shapes.off_track.arrays.texture_coord[i][0] *= 500 / 3;
            this.shapes.off_track.arrays.texture_coord[i][1] *= 500;
        }

        // *** Materials
        this.materials = {

            scorebox: new Material(new defs.Phong_Shader(),
            {ambient: 0, diffusivity: .3, specularity: .1, color: color(.5, .5, .5, 1)}),

            pausebox: new Material(new defs.Phong_Shader(),
            {ambient: 0, diffusivity: 0, specularity: 0, color: color(.5, .5, .5, 1)}),

            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            test2: new Material(new Gouraud_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#992828")}),
            ring: new Material(new Ring_Shader()),

            player: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: 0.6, color: hex_color("#2774AE")}),

            ground: new Material(new Texture_Rotate(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/curved_bricks.png", "NEAREST"),
            }),

            grass: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/grass.jpg", "NEAREST"),
            }),

            off_track: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0.6, color: hex_color("#348C31")}),

            sky: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0.6, color: hex_color("#40316A")}),

            andre: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: 0.6, color: hex_color("#FFD100")}),

            table: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: 0.6, color: hex_color("#444444")}),

            banner_leg: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/metal.jpg", "NEAREST"),
            }),

            banner_flag: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/silk.jpg", "NEAREST"),
            }),

            cloud: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0.6, color: hex_color("#D8D7D3")}),

            
        }

        ////////////////
        // GAME VARIABLES
        ////////////////

        this.member_model = Mat4.identity();
        this.initial_camera_location = Mat4.look_at(vec3(0, 5, 20), vec3(0, 0, 0), vec3(0, 1, 0));

        this.prospective_x = 0;
        this.player_x = 0;
        this.player_y = 0;
        this.player_z = 0;

        this.y_vel = 0;
        this.y_accel = 0;

        this.down_pressed = false;
        this.is_crouching = false;

        this.frames = 0;

        this.unpaused_time = 0;
        this.run_distance = 0;
        this.is_paused = false;
        this.game_over = false;

        this.left_cooldown_time = 0;
        this.right_cooldown_time = 0;

        this.obstacles = [];
        this.clouds = [];

        this.next_obstacle = 100;
        this.next_cloud = 12;

        this.just_reset_game = false;
    }

    jump() {
        if (this.player_y == 0 && !this.is_paused && !this.game_over)
            this.y_vel = 22.74;
    }

    shift_left() {
        if (!this.is_paused && !this.game_over && this.left_cooldown_time == 0) {
            this.prospective_x  = Math.max(this.prospective_x - 10, -10);
            this.left_cooldown_time = 1/6;
            this.right_cooldown_time = 0;
        }
    }

    shift_right() {
        if (!this.is_paused && !this.game_over && this.right_cooldown_time == 0) {
            this.prospective_x = Math.min(this.prospective_x + 10, 10);
            this.left_cooldown_time = 0;
            this.right_cooldown_time = 1/6;
        }
    }

    begin_crouch() {
        this.down_pressed = true;
    }

    end_crouch() {
        this.down_pressed = false;
    }

    reset_game() {
        this.member_model = Mat4.identity();
        this.initial_camera_location = Mat4.look_at(vec3(0, 5, 20), vec3(0, 0, 0), vec3(0, 1, 0));

        this.prospective_x = 0;
        this.player_x = 0;
        this.player_y = 0;
        this.player_z = 0;

        this.y_vel = 0;
        this.y_accel = 0;

        this.down_pressed = false;
        this.is_crouching = false;

        this.frames = 0;

        this.unpaused_time = 0;
        this.run_distance = 0;
        this.is_paused = false;
        this.game_over = false;

        this.left_cooldown_time = 0;
        this.right_cooldown_time = 0;

        this.obstacles = [];
        this.clouds = [];

        this.next_obstacle = 100;
        this.next_cloud = 12;

        this.just_reset_game = true;
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
        this.key_triggered_button("Reset", ["x"], () => this.reset_game());
        this.new_line();
        this.new_line();
        this.live_string(box => {
            box.textContent = "You've ran " + Math.trunc(this.run_distance) + " feet through Andre's forces!";
        });
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

        if (this.just_reset_game) {
            program_state.set_camera(this.initial_camera_location);
            this.just_reset_game = false;
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);


        let delta_time_seconds = program_state.animation_delta_time / 1000;

        if (this.is_paused || this.game_over) {
            delta_time_seconds = 0;
        }
        
        this.unpaused_time += delta_time_seconds;

/*
        const score_box = Mat4.rotation(0, Math.cos(t), Math.sin(t), .7 * Math.cos(t));
        this.shapes.cube.draw(context, program_state, score_box, this.grey);


        let strings = ["This is some text", "More text", "1234567890", "This is a line.\n\n\n" + "This is another line.",
            Math.trunc(t).toString(), Text_Line.toString()];

        // Sample the "strings" array and draw them onto a cube.
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 2; j++) {             // Find the matrix for a basis located along one of the cube's sides:
                let cube_side = Mat4.rotation(i == 0 ? Math.PI / 2 : 0, 1, 0, 0)
                    .times(Mat4.rotation(Math.PI * j - (i == 1 ? Math.PI / 2 : 0), 0, 1, 0))
                    .times(Mat4.translation(-.9, .9, 1.01));

                const multi_line_string = strings[2 * i + j].split('\n');
                // Draw a Text_String for every line in our string, up to 30 lines:
                for (let line of multi_line_string.slice(0, 1)) {             // Assign the string to Text_String, and then draw it.
                    this.shapes.text.set_string(line, context.context);
                    this.shapes.text.draw(context, program_state, score_box.times(cube_side)
                        .times(Mat4.scale(.4, .4, .03).times(Mat4.translation(1,-1,0))), this.text_image);
                    // Move our basis down a line.
                    cube_side.post_multiply(Mat4.translation(0, -.06, 0));
                }
            }
*/ 



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
        //this.member_model = this.member_model.times(Mat4.translation(this.prospective_x, this.player_y, this.player_z));


        
        this.left_cooldown_time = Math.max(this.left_cooldown_time - delta_time_seconds, 0);
        this.right_cooldown_time = Math.max(this.right_cooldown_time - delta_time_seconds, 0);

        ///
        /// X axis movement
        ///
        if(this.player_x < this.prospective_x)
        {
            let translation_distance = Math.min(this.player_x + delta_time_seconds * 60, this.prospective_x) - this.player_x;
            this.member_model = this.member_model.times(Mat4.translation(translation_distance, 0, 0));
            this.player_x += translation_distance;
        }
        if(this.player_x > this.prospective_x)
        {
            let translation_distance = Math.max(this.player_x - delta_time_seconds * 60, this.prospective_x) - this.player_x;
            this.member_model = this.member_model.times(Mat4.translation(translation_distance, 0, 0));
            this.player_x += translation_distance;
        }


        ///
        /// Y axis movement
        ///

        // Using inspiration from Minecraft Steve, we assume the player (who is 8.5 units tall)
        // is 1.875 m tall and can jump 1.25 m in the air.
        // We assume that gravity is -9.8 m/s^2.
        // This makes their jump have an initial velocity of 4.95 m/s.
            
        if (this.down_pressed)
            this.y_accel = -360.22;
        else
            this.y_accel = -45.03;
        let y_new = Math.max(this.player_y + this.y_vel * delta_time_seconds, 0);
        if (y_new == 0)
            this.y_vel = 0;
        let delta_y = y_new - this.player_y;
        this.member_model = this.member_model.times(Mat4.translation(0, delta_y, 0));
        this.player_y = y_new;
            
        this.y_vel = this.y_vel + this.y_accel * delta_time_seconds;

        

        
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

        if(this.unpaused_time % 2 < 1)
        {
            this.frames/=2
            console.log("Frames Per Second: " + this.frames);
            this.frames = 0;
        }

        let current_speed = 19.57 + 0.10 * this.unpaused_time;

        let limb_rotation = Math.PI / 6 * Math.sin(this.unpaused_time * current_speed / 6.0 * Math.PI);
        if (!this.is_paused && !this.game_over)
            this.is_crouching = this.down_pressed && (this.player_y == 0);

        let player_head_mat = player_model_transform;
        if (this.is_crouching) {
            player_head_mat = player_head_mat.times(Mat4.translation(0, -4.25, 0));
            player_head_mat = player_head_mat.times(Mat4.rotation(-1 * Math.PI / 2, 1, 0, 0));
            player_head_mat = player_head_mat.times(Mat4.translation(0, 4.25, 0));
        }
        player_head_mat = player_head_mat.times(Mat4.scale(1.25, 1.25, 1.25));
        this.shapes.player_head.draw(context, program_state, player_head_mat, this.materials.player);

        let player_torso_mat = player_model_transform;
        player_torso_mat = player_torso_mat.times(Mat4.translation(0, -2.75, 0));
        if (this.is_crouching) {
            player_torso_mat = player_torso_mat.times(Mat4.translation(0, -1.5, 0));
            player_torso_mat = player_torso_mat.times(Mat4.rotation(-1 * Math.PI / 2, 1, 0, 0));
            player_torso_mat = player_torso_mat.times(Mat4.translation(0, 1.5, 0));
        }
        player_torso_mat = player_torso_mat.times(Mat4.scale(1, 1.5, 0.5));
        this.shapes.player_torso.draw(context, program_state, player_torso_mat, this.materials.player);

        let player_left_arm_mat = player_model_transform;
        player_left_arm_mat = player_left_arm_mat.times(Mat4.translation(-1.5, -2.75, 0));
        if (this.is_crouching) {
            player_left_arm_mat = player_left_arm_mat.times(Mat4.translation(0, -1.5, 0));
            player_left_arm_mat = player_left_arm_mat.times(Mat4.rotation(-1 * Math.PI / 2, 1, 0, 0));
            player_left_arm_mat = player_left_arm_mat.times(Mat4.translation(0, 1.5, 0));
        }
        player_left_arm_mat = player_left_arm_mat.times(Mat4.translation(0.5, 1.5, 0));
        player_left_arm_mat = player_left_arm_mat.times(Mat4.rotation(Math.PI / 48.0 * (-1), 0, 0, 1));
        if ((this.player_y == 0) && !this.is_crouching)
            player_left_arm_mat = player_left_arm_mat.times(Mat4.rotation(limb_rotation, 1, 0, 0));
        player_left_arm_mat = player_left_arm_mat.times(Mat4.translation(-0.5, -1.5, 0));
        player_left_arm_mat = player_left_arm_mat.times(Mat4.scale(0.5, 1.5, 0.5));
        this.shapes.player_left_arm.draw(context, program_state, player_left_arm_mat, this.materials.player);

        let player_right_arm_mat = player_model_transform;
        player_right_arm_mat = player_right_arm_mat.times(Mat4.translation(1.5, -2.75, 0));
        if (this.is_crouching) {
            player_right_arm_mat = player_right_arm_mat.times(Mat4.translation(0, -1.5, 0));
            player_right_arm_mat = player_right_arm_mat.times(Mat4.rotation(-1 * Math.PI / 2, 1, 0, 0));
            player_right_arm_mat = player_right_arm_mat.times(Mat4.translation(0, 1.5, 0));
        }
        player_right_arm_mat = player_right_arm_mat.times(Mat4.translation(-0.5, 1.5, 0));
        player_right_arm_mat = player_right_arm_mat.times(Mat4.rotation(Math.PI / 48.0, 0, 0, 1));
        if ((this.player_y == 0) && !this.is_crouching)
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


        let sky_transform = Mat4.identity();
        sky_transform = sky_transform.times(Mat4.scale(510, 80, 750));
        let sky_gradient = 0;
        let time_of_day = this.unpaused_time % 120.0;
        if (time_of_day < 60.0) sky_gradient = 1;
        else if (time_of_day < 65.0) sky_gradient = (65.0 - time_of_day) / 5.0;
        else if (time_of_day < 115.0) sky_gradient = 0;
        else sky_gradient = (time_of_day - 115.0) / 5.0;
        let sky_red = 0.25 + 0.21 * sky_gradient;
        let sky_green = 0.19 + 0.56 * sky_gradient;
        let sky_blue = 0.42 + 0.55 * sky_gradient;
        this.shapes.sky.draw(context, program_state, sky_transform, this.materials.sky.override({color: color(sky_red, sky_green, sky_blue, 1.0)}));

        let frame_distance = delta_time_seconds * current_speed;
        this.run_distance += frame_distance;
        let ground_offset = this.run_distance % (528.0 * 2**0.5);
        let off_track_offset = this.run_distance % 3.0;

        let left_off_track_transform = Mat4.identity();
        left_off_track_transform = left_off_track_transform.times(Mat4.translation(-520, -22.25, off_track_offset));
        left_off_track_transform = left_off_track_transform.times(Mat4.scale(500, 15, 1500)); //!!
        this.shapes.off_track.draw(context, program_state, left_off_track_transform, this.materials.grass);

        let right_off_track_transform = Mat4.identity();
        right_off_track_transform = right_off_track_transform.times(Mat4.translation(520, -22.25, off_track_offset));
        right_off_track_transform = right_off_track_transform.times(Mat4.scale(500, 15, 750)); //!!
        this.shapes.off_track.draw(context, program_state, right_off_track_transform, this.materials.grass);

        let ground_transform = Mat4.identity();
        ground_transform = ground_transform.times(Mat4.translation(0, -22.25, ground_offset));
        ground_transform = ground_transform.times(Mat4.scale(20, 15, 1500)); //!!
        this.shapes.ground.draw(context, program_state, ground_transform, this.materials.ground);

        //////////////////
        // SPAWN SCENERY
        //////////////////

        while (this.next_cloud < this.run_distance / 2.0 + 750) {
            let cloud_x = Math.random() * 1020.0 - 510.0;
            let cloud_x_size = Math.random() * 36.0 + 18.0;
            let cloud_z_size = Math.random() * 36.0 + 18.0;
            this.clouds.push(new Cloud(cloud_x, 17, this.run_distance / 2.0 - this.next_cloud, cloud_x_size, cloud_z_size, this));
            this.next_cloud += 25.0 * Math.random();
        }

        let cloud_red = 0.40 + 0.22 * sky_gradient;
        let cloud_green = 0.34 + 0.25 * sky_gradient;
        let cloud_blue = 0.34 + 0.24 * sky_gradient;

        for (let i = 0; i < this.clouds.length; i++) {
            let current_cloud = this.clouds[i];
            current_cloud.advance(frame_distance / 2);
            current_cloud.draw(context, program_state, color(cloud_red, cloud_green, cloud_blue, 0.5));
            if (current_cloud.z > 80) {
                this.clouds.splice(i, 1);
                i -= 1;
            }
            
        }

        ///////////////////
        // SPAWN OBSTACLES
        ///////////////////
        while (this.next_obstacle < this.run_distance + 750) {
            switch (Math.floor(Math.random() * 12)) {
                case 0:
                    this.obstacles.push(new Andre(0, 0, this.run_distance - this.next_obstacle, this));
                    break;
                case 1:
                    this.obstacles.push(new Andre(-10, 0, this.run_distance - this.next_obstacle, this));
                    break;
                case 2:
                    this.obstacles.push(new Andre(10, 0, this.run_distance - this.next_obstacle, this));
                    break;
                case 3:
                    this.obstacles.push(new Andre(-10, 0, this.run_distance - this.next_obstacle, this));
                    this.obstacles.push(new Andre(0, 0, this.run_distance - this.next_obstacle, this));
                    break;
                case 4:
                    this.obstacles.push(new Andre(-10, 0, this.run_distance - this.next_obstacle, this));
                    this.obstacles.push(new Andre(10, 0, this.run_distance - this.next_obstacle, this));
                    break;
                case 5:
                    this.obstacles.push(new Andre(0, 0, this.run_distance - this.next_obstacle, this));
                    this.obstacles.push(new Andre(10, 0, this.run_distance - this.next_obstacle, this));
                    break;
                case 6:
                case 7:
                case 8:
                case 9:
                    this.obstacles.push(new Table(0, 0, this.run_distance - this.next_obstacle, this));
                    break;
                case 10:
                case 11:
                    let banner_height = 6.375 + 3.542 * Math.random();
                    this.obstacles.push(new Banner(0, 0, this.run_distance - this.next_obstacle, this, banner_height));
                    break;
            }
            console.log(this.next_obstacle);
            this.next_obstacle += 24.0 + 24.0 * Math.random();
        }

                

        for (let i = 0; i < this.obstacles.length; i++) {
            let current_obstacle = this.obstacles[i];
            current_obstacle.advance(frame_distance);
            if (current_obstacle.check_collision(this.player_x, this.player_y, this.player_z, this.is_crouching)) {
                this.game_over = true;
            }
            current_obstacle.draw(context, program_state);
            if (current_obstacle.z > 40) {
                this.obstacles.splice(i, 1);
                i -= 1;
            }
        }

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


        // SCORE BOX

        let boxx = 20;
        let boxy = .5;

        const score_box = Mat4.translation(0,8,-5).times(Mat4.scale(boxx,boxy,1));
        this.shapes.cube.draw(context, program_state, score_box, this.grey);

        let diststring = Math.trunc(this.run_distance).toString();
        let strings = ["", "", "", "",
        "Score: " + diststring, ""];

        // Sample the "strings" array and draw them onto a cube.
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 2; j++) {             // Find the matrix for a basis located along one of the cube's sides:
                let cube_side = Mat4.rotation(i == 0 ? Math.PI / 2 : 0, 1, 0, 0)
                    .times(Mat4.rotation(Math.PI * j - (i == 1 ? Math.PI / 2 : 0), 0, 1, 0))
                    .times(Mat4.translation(-.9, .9, 1.01));

                const multi_line_string = strings[2 * i + j].split('\n');
                // Draw a Text_String for every line in our string, up to 30 lines:
                for (let line of multi_line_string.slice(0, 30)) {             // Assign the string to Text_String, and then draw it.
                    this.shapes.text.set_string(line, context.context);
                    this.shapes.text.draw(context, program_state, score_box.times(cube_side)
                        .times(Mat4.scale(.4/boxx, .4/boxy, .03).times(Mat4.translation(2*boxx-2,-1,0))), this.text_image);
                    // Move our basis down a line.
                    cube_side.post_multiply(Mat4.translation(0, -.06, 0));
                }
            }


            // PAUSE BUTTON
            if(this.is_paused || this.game_over)
            {
                let pause_boxx = 10;
                let pause_boxy = .5;
        
                const pause_box = Mat4.translation(0,3,10).times(Mat4.scale(pause_boxx,pause_boxy,1));
                this.shapes.cube.draw(context, program_state, pause_box, this.grey);
        
                let end_message = "Game Over";
                let pause_message = "Paused";
                let message = pause_message;
                let message_shift = 1.4;
                if(this.game_over)
                    {
                        message = end_message;
                        message_shift = 3.7;
                    }


                let pause_strings = ["", "", "", "",
                message, ""];
        
                // Sample the "strings" array and draw them onto a cube.
                for (let i = 0; i < 3; i++)
                    for (let j = 0; j < 2; j++) {             // Find the matrix for a basis located along one of the cube's sides:
                        let cube_side = Mat4.rotation(i == 0 ? Math.PI / 2 : 0, 1, 0, 0)
                            .times(Mat4.rotation(Math.PI * j - (i == 1 ? Math.PI / 2 : 0), 0, 1, 0))
                            .times(Mat4.translation(-.9, .9, 1.01));
        
                        const multi_line_string2 = pause_strings[2 * i + j].split('\n');
                        // Draw a Text_String for every line in our string, up to 30 lines:
                        for (let line of multi_line_string2.slice(0, 30)) {             // Assign the string to Text_String, and then draw it.
                            this.shapes.text.set_string(line, context.context);
                            this.shapes.text.draw(context, program_state, pause_box.times(cube_side)
                                .times(Mat4.scale(.4/pause_boxx, .4/pause_boxy, .03).times(Mat4.translation(2*pause_boxx-message_shift,-1,0))), this.text_image);
                            // Move our basis down a line.
                            cube_side.post_multiply(Mat4.translation(0, -.06, 0));
                        }
                    }
            }




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

class Texture_Rotate extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #7.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            void main(){
                // Sample the texture image in the correct place:
                mat2 rotation_matrix = mat2(0.7071067812, 0.7071067812, -0.7071067812, 0.7071067812);
                vec2 new_tex_coord = f_tex_coord - vec2(0.5, 0.5);
                new_tex_coord = rotation_matrix * new_tex_coord;
                new_tex_coord = new_tex_coord + vec2(0.5, 0.5);
                vec4 tex_color = texture2D( texture, new_tex_coord );
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, tex_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}