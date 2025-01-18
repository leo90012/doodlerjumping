class Platform {
    // Collision box dimensions
    static w = 110;
    static h = 28;
    // Horizontal speed scalar
    static speed = 2;
    // Spring dimensions
    static springW = 14;
    static springH = 14;
    // Image handle
    static springImage;

    /**
     * Construct with position and type
     * default vx = speed
     * @param {Number} x
     * @param {Number} y
     * @param {Platform.platformTypes} type
     * @param {Boolean} springed
     */
    constructor(x, y, type, springed) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = Platform.speed;
        // Does the platform have a spring on it
        this.springed = springed;
        // Randomly initialize spring position : relative
        if (springed) {
            this.springX = (Math.random() - 0.5) * Platform.w * 0.8;
            this.springY = -Platform.h / 2 - Platform.springH / 2;
        } else {
            this.springX = null;
            this.springY = null;
        }
    }
    render() {
        // Do not draw invisible
        if (this.type === Platform.platformTypes.INVISIBLE) return;

        // Set the fill color based on platform type
        let fillColor;
        switch (this.type) {
            case Platform.platformTypes.STABLE:
                fillColor = color("#29903b");
                break;
            case Platform.platformTypes.MOVING:
                fillColor = color("#CBEFFF");
                break;
            case Platform.platformTypes.FRAGILE:
                fillColor = color("7f0010");
                break;
            default:
                fillColor = color("#8ac43d");
        }

        // Draw hand-drawn style platform
        fill(fillColor);
        stroke(0);
        strokeWeight(2);
        beginShape();
        for (let i = 0; i < TWO_PI; i += PI / 6) {
            let x = this.x + Platform.w / 2 * cos(i) + random(-2, 2);
            let y = this.y + Platform.h / 2 * sin(i) + random(-2, 2);
            vertex(x, y);
        }
        endShape(CLOSE);

        // Draw spring if applicable
        if (this.springed) {
            image(
                Platform.springImage,
                this.x + this.springX - Platform.springW / 2,
                this.y + this.springY - Platform.springH / 2,
                Platform.springW+20,
                Platform.springH +20
            );
        }
    }

    /**
     * Update the moving platform
     * This method assumes the platform is moving
     * Must check type before calling this function, for better performance
     */
    update() {
        this.x += this.vx;
        if (this.x > width - Platform.w / 2 || this.x < Platform.w / 2) {
            this.vx *= -1;
        }
    }

    /**
     * Static inner class for platformTypes enum and utils
     * Value is the probability of spawn rate out of 10
     */
    static platformTypes = {
        STABLE: 5,
        MOVING: 2,
        FRAGILE: 3,
        INVISIBLE: 0,

        /**
         * Get a random platform type
         * @returns {Platform.platformTypes} platformType
         */
        getRandomType() {
            const rand = Math.random() * 10;
            return rand < this.STABLE
                ? this.STABLE
                : rand < this.STABLE + this.MOVING
                ? this.MOVING
                : this.FRAGILE;
        },

        /**
         * Get the render color of the given platform type
         * @param {Platform.platformTypes} type
         */
        getColor(type) {
            switch (type) {
                case this.STABLE:
                    return color("#8ac43d");
                case this.MOVING:
                    return color("#31b8d6");
                case this.FRAGILE:
                    return color(255);
                default:
                    return null;
            }
        },
    };
}
