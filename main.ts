
/*
 *  A Navigation sensor that provides tilt compensated heading, pitch, roll and 5 simultaneous lidar based range readings
 *  The sensor is based on a Particle's mesh device and can optionaly sync data with a remote server via Wifi, mesh network or cellular network 
 *  This is a makecode-mindstorms ev3 extension to communicate with the sensor 
 */

enum NavigationSensorEvent {
    //% block="object detected"
    ObjectDetected = 10,
    //% block="object near"
    ObjectNear = sensors.ThresholdState.Low
}

// RANGE mode: range (distance to closest obstacle, in mm) for: front left , front right , left side, right side, rear center
// HEADING mode:  tilt compensated heading (degrees to magnetic north), pitch angle , roll angle in degress
const enum NavigationSensorMode {
    None = -1,
    //% block="RANGE"
    RANGE = 0,
    //% block="HEADING"
    HEADING = 1,
}

namespace sensors {

    //% fixedInstances
    export class NavigationSensor extends internal.UartSensor {
        private promixityThreshold: sensors.ThresholdDetector;
        private movementThreshold: number;

        constructor(port: number) {
            super(port)
            this.promixityThreshold = new sensors.ThresholdDetector(this.id(), 0, 255, 10, 100); // range is 0..255cm
            this.movementThreshold = 1;
            this._setMode(NavigationSensorMode.HEADING);
        }

        _deviceType() {
            return DAL.DEVICE_TYPE_THIRD_PARTY_START //50
        }

        _query(): number {
            return (this.getNumber(NumberFormat.Int16LE, 0)); // default output is heading
        }
        // return object id if sync'ed, N.C. otherwise
        _info(): string {
            if (this.isActive())
                return `id:${this.id()}`
            return "N.C."
            //return `Left: ${this.distanceLeft()}cm`
        }

        _update(prev: number, curr: number) {
            // is there an object near?
            this.promixityThreshold.setLevel(curr);

            // did something change?
            if (Math.abs(prev - curr) > this.movementThreshold)
                control.raiseEvent(this._id, NavigationSensorEvent.ObjectDetected);
        }

        /**
         * Registers code to run when an object is close or detected
         * @param handler the code to run when detected
         */
        //% help=sensors/navigation/on-event 
        //% blockId=navigationOn
        //% block="on **navigation** %this|%event"
        //% parts="navigationsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=100 blockGap=8
        //% group="Navigation Sensor"
        onEvent(event: NavigationSensorEvent, handler: () => void) {
            control.onEvent(this._id, event, handler);
        }

        /**
         * Waits for the event to occur
         */
        //% help=sensors/navigation/pause-until
        //% block="pause until **navigation** %this| %event"
        //% blockId=navigationWait
        //% parts="navigationsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=99 blockGap=8
        //% group="Navigation Sensor"
        pauseUntil(event: NavigationSensorEvent) {
            control.waitForEvent(this._id, event);
        }

        /**
         * Gets the front left range from the front left lidar in millimeters
         * @param sensor the navigation sensor port
         */
        //% help=sensors/navigation/distancefrontleft
        //% block="**navigation** %this|distanceFrontLeft"
        //% blockId=lidarGetDistanceFrontLeft
        //% parts="navigationsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=65
        //% group="Navigation Sensor"
        distanceFrontLeft(): number {
            // in mm
            this._setMode(NavigationSensorMode.RANGE)
            return this.getNumber(NumberFormat.UInt16LE, 0)
        }


        /**
        * Gets the front right range from the front right lidar in millimeters
        * @param sensor the navigation sensor port
        */
        //% help=sensors/navigation/distanceFrontRight
        //% block="**navigation** %this|distanceFrontRight"
        //% blockId=lidarGetDistanceFrontRight
        //% parts="navigationsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=65
        //% group="Navigation Sensor"
        distanceFrontRight(): number {
            // in mm
            this._setMode(NavigationSensorMode.RANGE)
            return this.getNumber(NumberFormat.UInt16LE, 2)
        }


        /**
        * Gets the rear range from the rear center lidar in millimeters
        * @param sensor the navigation sensor port
        */
        //% help=sensors/navigation/distanceRear
        //% block="**navigation** %this|distanceRear"
        //% blockId=lidarGetDistanceRear
        //% parts="navigationsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=65
        //% group="Navigation Sensor"
        distanceRear(): number {
            // in mm
            this._setMode(NavigationSensorMode.RANGE)
            return this.getNumber(NumberFormat.UInt16LE, 8)
        }


        /**
        * Gets the left side range from the left side lidar in millimeters
        * @param sensor the navigation sensor port
        */
        //% help=sensors/navigation/distanceLeftSide
        //% block="**navigation** %this|distanceLeftSide"
        //% blockId=lidarGetDistanceLeftSide
        //% parts="navigationsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=65
        //% group="Navigation Sensor"
        distanceLeftSide(): number {
            // in mm
            this._setMode(NavigationSensorMode.RANGE)
            return this.getNumber(NumberFormat.UInt16LE, 4)
        }


        /**
        * Gets the right side range from the right side lidar in millimeters
        * @param sensor the navigation sensor port
        */
        //% help=sensors/navigation/distanceRightSide
        //% block="**navigation** %this|distanceRightSide"
        //% blockId=lidarGetDistanceRightSide
        //% parts="navigationsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=65
        //% group="Navigation Sensor"
        distanceRightSide(): number {
            // in mm
            this._setMode(NavigationSensorMode.RANGE)
            return this.getNumber(NumberFormat.UInt16LE, 6)
        }


        /**
        * Gets the tilt-compensated heading from the compass in degrees
        * @param sensor the navigation sensor port
        */
        //% help=sensors/navigation/heading
        //% block="**navigation** %this|heading"
        //% blockId=lidarGetHeading
        //% parts="navigationsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=65
        //% group="Navigation Sensor"
        heading(): number {
            // in degrees [0:360]
            this._setMode(NavigationSensorMode.HEADING)
            return this.getNumber(NumberFormat.Int16LE, 0)
        }

        /**
        * Gets the pitch angle in degrees, negative when pitching down, -90 to 89
        * @param sensor the navigation sensor port
        */
        //% help=sensors/navigation/pitch
        //% block="**navigation** %this|pitch"
        //% blockId=lidarGetPitch
        //% parts="navigationsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=65
        //% group="Navigation Sensor"
        pitch(): number {
            // in degrees [-90:89]
            this._setMode(NavigationSensorMode.HEADING)
            return this.getNumber(NumberFormat.Int16LE, 2)
        }


        /**
        * Gets the roll angle in degrees, negative when rolling left, -180 to 179
        * @param sensor the navigation sensor port
        */
        //% help=sensors/navigation/roll
        //% block="**navigation** %this|roll"
        //% blockId=lidarGetRoll
        //% parts="navigationsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=65
        //% group="Navigation Sensor"
        roll(): number {
            // in degrees [-189:179]
            this._setMode(NavigationSensorMode.HEADING)
            return this.getNumber(NumberFormat.Int16LE, 4)
        }


        /**
         * Sets a threshold value
         * @param condition the near or detected condition
         * @param value the value threshold
         */
        //% blockId=navigationSetThreshold block="set **navigation** %this|%condition|to %value"
        //% group="Calibration" blockGap=8 weight=80
        //% value.min=0 value.max=255
        //% this.fieldEditor="ports"
        setThreshold(condition: NavigationSensorEvent, value: number) {
            switch (condition) {
                case NavigationSensorEvent.ObjectNear: this.promixityThreshold.setLowThreshold(value); break;
                case NavigationSensorEvent.ObjectDetected: this.movementThreshold = value; break;
            }
        }

        /**
         * Gets the threshold value
         * @param condition the proximity condition
         */
        //% blockId=navigationGetThreshold block="**navigation** %this|%condition"
        //% group="Calibration" weight=79
        //% this.fieldEditor="ports"
        threshold(condition: NavigationSensorEvent): number {
            switch (condition) {
                case NavigationSensorEvent.ObjectNear: return this.promixityThreshold.threshold(ThresholdState.Low);
                case NavigationSensorEvent.ObjectDetected: return this.movementThreshold;
            }
            return 0;
        }
    }

    //% fixedInstance whenUsed block="1" jres=icons.port1
    export const navigation1: NavigationSensor = new NavigationSensor(1)

    //% fixedInstance whenUsed block="2" jres=icons.port2
    export const navigation2: NavigationSensor = new NavigationSensor(2)

    //% fixedInstance whenUsed block="3" jres=icons.port3
    export const navigation3: NavigationSensor = new NavigationSensor(3)
    //% fixedInstance whenUsed block="4" jres=icons.port4
    export const navigation4: NavigationSensor = new NavigationSensor(4)
}

