//
// pog
//
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

class UCLA_Flag {
    constructor(x, y, z, scene) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.scene = scene;
    }

    advance(distance) {
        this.z += distance;
    }

    draw(context, program_state) {
        let flagpole_mat = Mat4.identity();
        flagpole_mat = flagpole_mat.times(Mat4.translation(this.x, this.y + 2.75, this.z));
        flagpole_mat = flagpole_mat.times(Mat4.scale(0.14, 10.0, 0.14));
        this.scene.shapes.flagpole.draw(context, program_state, flagpole_mat, this.scene.materials.banner_leg);

        let ucla_flag_mat = Mat4.identity();
        ucla_flag_mat = ucla_flag_mat.times(Mat4.translation(this.x + 3.18, this.y + 10.75, this.z));
        ucla_flag_mat = ucla_flag_mat.times(Mat4.scale(3.18, 2.0, 0.13));
        this.scene.shapes.ucla_flag.draw(context, program_state, ucla_flag_mat, this.scene.materials.ucla_flag);

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
        let andre_leg_center_y = this.y - 5.75;

        let player_x = p_x;
        let player_z = p_z; 
        let player_head_center_y = p_y;
        let player_torso_center_y = p_y - 2.75;
        let player_leg_center_y = p_y - 5.75;
        
        // PLAYER CROUCHING
        if(p_crouch){
            // CHECK PLAYER HEAD, ANDRE TORSO
            let head_center_z = -4.25;
            if (Math.abs(player_x - andre_x) <= (1.0+2) && Math.abs(head_center_z - andre_z) <= (1.0+0.5)) {
                return true;
            }

            // CHECK PLAYER TORSO, ANDRE TORSO
            let torso_center_z = -1.5;
            if (Math.abs(player_x - andre_x) <= (2.0+2) && Math.abs(torso_center_z - andre_z) <= (0.5+0.5)) {
                return true;
            }

            // CHECK PLAYER LEG, ANDRE LEG
            if (Math.abs(player_x - andre_x) <= (1.0+1.0) && Math.abs(player_z - andre_z) <= (0.5+0.5)) {
                return true;
            }
            
        }

        // PLAYER NOT CROUCHING

        else {
            // CHECK PLAYER HEAD, ANDRE HEAD
            if(Math.abs(player_x - andre_x) <= 2.0 && Math.abs(player_z - andre_z) <= 2.0
                    && Math.abs(player_head_center_y - andre_head_center_y) <= 2.0){
                return true;
            }
            
            // CHECK PLAYER TORSO, ANDRE HEAD
            if(Math.abs(player_x - andre_x) <= (2+1.0) && Math.abs(player_z - andre_z) <= (0.5+1.0)
                    && Math.abs(player_torso_center_y - andre_head_center_y) <= (1.5+1.0)){
                return true;
            }

            // CHECK PLAYER TORSO, ANDRE TORSO
            if(Math.abs(player_x - andre_x) <= (2+2) && Math.abs(player_z - andre_z) <= (0.5+0.5)
                    && Math.abs(player_torso_center_y - andre_torso_center_y) <= (1.5+1.5)){
                return true;
            }

            // CHECK PLAYER LEG, ANDRE HEAD
            if(Math.abs(player_x - andre_x) <= (1+1.0) && Math.abs(player_z - andre_z) <= (0.5+1.0)
                    && Math.abs(player_leg_center_y - andre_head_center_y) <= (1.5+1.0)){
                return true;
            }

            // CHECK PLAYER LEG, ANDRE TORSO
            if(Math.abs(player_x - andre_x) <= (1+2.0) && Math.abs(player_z - andre_z) <= (0.5+0.5)
                    && Math.abs(player_leg_center_y - andre_torso_center_y) <= (1.5+1.5)){
                return true;
            }

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
        
        // CHECK HEAD COLLISION
        if (Math.abs(head_center_y - banner_center_y) <= (1.0+2.42) && Math.abs(head_center_z - banner_center_z) <= (1.0+0.13)) {
            return true;
        }

        // CHECK TORSO COLLISION
        let torso_center_y = p_y - 2.75;
        let torso_center_z = p_z;
        if (Math.abs(torso_center_y - banner_center_y) <= (1.5+2.42) && Math.abs(torso_center_z - banner_center_z) <= (0.5+0.13)) {
            return true;
        }
        
        return false;
    }
}


export class BruinWalk extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            //text box code:
            cube: new defs.Cube(), 
            text: new Text_Line(35),
            //end text box code
            
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

            ucla_flag: new defs.Cube(),
            flagpole: new defs.Cube(),
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

            ucla_flag: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/ucla.png", "NEAREST"),
            }),

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
        this.ucla_flags = [];

        this.next_obstacle = 100;
        this.next_cloud = 12;
        this.next_flag = 200;

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
        this.ucla_flags = [];

        this.next_obstacle = 100;
        this.next_cloud = 12;
        this.next_flag = 200;

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
            box.textContent = "You've run " + Math.trunc(this.run_distance) + " feet through Andre's forces!";
        });
    }

    display(context, program_state) {

        //diagnostics

        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:

        ///////////////////
        // SET CAMERA
        ///////////////////
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


        /////////////////
        // TIME STUFF
        /////////////////

        let delta_time_seconds = program_state.animation_delta_time / 1000;

        if (this.is_paused || this.game_over) {
            delta_time_seconds = 0;
        }
        
        this.unpaused_time += delta_time_seconds;
        
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

        
        ////////////////////////////////////////////
        // SET UP TRANSFORM MATRICES AND LIGHT
        ////////////////////////////////////////////
        
        let object_model_transform = Mat4.identity();

        let player_model_transform = this.member_model;

        const light_position = vec4(0, 0, 10, 1);
        const white = color(1,1,1,1);
        program_state.lights = [new Light(light_position, white, 1000)];

        let current_speed = 19.57 + 0.10 * this.unpaused_time;

        let limb_rotation = Math.PI / 6 * Math.sin(this.unpaused_time * current_speed / 6.0 * Math.PI);
        if (!this.is_paused && !this.game_over)
            this.is_crouching = this.down_pressed && (this.player_y == 0);

        ////////////////////
        // DRAW PLAYER
        ////////////////////

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


        //////////////////////
        // DRAW BACKGROUND
        //////////////////////

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

        while (this.next_flag < this.run_distance + 750) {
            this.ucla_flags.push(new UCLA_Flag(22, 0, this.run_distance - this.next_flag, this));
            this.next_flag += 200.0;
        }

        for (let i = 0; i < this.ucla_flags.length; i++) {
            let current_flag = this.ucla_flags[i];
            current_flag.advance(frame_distance);
            current_flag.draw(context, program_state);
            if (current_flag.z > 40) {
                this.ucla_flags.splice(i, 1);
                i -= 1;
            }
        }

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
            //console.log(this.next_obstacle);
            this.next_obstacle += 24.0 + 24.0 * Math.random();
        }

                

        for (let i = 0; i < this.obstacles.length; i++) {
            let current_obstacle = this.obstacles[i];
            current_obstacle.advance(frame_distance);
            if (this.player_z - current_obstacle.z < 10 
                && current_obstacle.check_collision(this.player_x, this.player_y, this.player_z, this.is_crouching)) {
                this.game_over = true;
            }
            current_obstacle.draw(context, program_state);
            if (current_obstacle.z > 40) {
                this.obstacles.splice(i, 1);
                i -= 1;
            }
        }

        
        //////////////////////////
        // SCORE BOX
        //////////////////////////

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

class Texture_Rotate extends Textured_Phong {
    // GROUND SHADER
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