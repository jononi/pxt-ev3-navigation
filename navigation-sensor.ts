/* Navigation sensor : custom EV3 sensor based on Particle's Xenon device
*
*/

enum NavigationSensorEvent {
    //% block="object detected"
    ObjectDetected = 10,
    //% block="object near on left"
    ObjectNearLeft = 4,
    //% block="object near on right"
    ObjectNearRight = 5,
    //% block="object near"
    ObjectNear = sensors.ThresholdState.Low, //Normal=1, High=2, Low=3
}


// NAV1 mode:   left range, right range, heading angle
// NAV2 mode:   heading, pitch, roll angles
const enum NavigationSensorMode {
    None = -1,
    //% block="NAV1"
    NAV1 = 0,
    //% block="NAV2"
    NAV2 = 1,
}

namespace sensors {

    //% fixedInstances
    export class NavigationSensor extends internal.UartSensor {
        private promixityThreshold: sensors.ThresholdDetector;
        private movementThreshold: number;

        constructor(port: number) {
            super(port)
            //min, max, th_low, th_high, in mm
            this.promixityThreshold = new sensors.ThresholdDetector(this.id(), 0, 2500, 100, 1500);
            this.movementThreshold = 1;
            this._setMode(NavigationSensorMode.NAV1);
        }

        _deviceType() {
            return DAL.DEVICE_TYPE_THIRD_PARTY_START //50
        }

        _query(): number {
            return (this.getNumber(NumberFormat.UInt16LE, 0)); // left range in mm
        }

        _info(): string {
            if (this.isActive())
                return `id:${this.id()}`
            return "N.C."
            //return `Left: ${this.distanceLeft()}cm`
        }

        _update(prev: number, curr: number) {
            // is there an object near? see code in: core/input.ts
            this.promixityThreshold.setLevel(curr);

            // did something change? detects movement/change
            if (Math.abs(prev - curr) > this.movementThreshold)
                control.raiseEvent(this._id, NavigationSensorEvent.ObjectDetected);

            // is there an obstacle on the right?
            if (this.distanceRight() < this.promixityThreshold.lowThreshold)
                control.raiseEvent(this._id, NavigationSensorEvent.ObjectNearRight);

            // is there an obstacle on the left?
            if (this.distanceLeft() < this.promixityThreshold.lowThreshold)
                control.raiseEvent(this._id, NavigationSensorEvent.ObjectNearLeft);
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
         * Gets the left range from the left lidar in millimeters
         * @param sensor the navigation sensor port
         */
        //% help=sensors/navigation/distanceleft
        //% block="**navigation** %this|distanceleft"
        //% blockId=lidarGetDistanceLeft
        //% parts="navigationsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=65
        //% group="Navigation Sensor"
        distanceLeft(): number {
            // in mm
            this._setMode(NavigationSensorMode.NAV1)
            return this.getNumber(NumberFormat.UInt16LE, 0)
        }


        /**
        * Gets the right range from the right lidar in millimeters
        * @param sensor the navigation sensor port
        */
        //% help=sensors/navigation/distanceright
        //% block="**navigation** %this|distanceright"
        //% blockId=lidarGetDistanceRight
        //% parts="navigationsensor"
        //% blockNamespace=sensors
        //% this.fieldEditor="ports"
        //% weight=65
        //% group="Navigation Sensor"
        distanceRight(): number {
            // in mm
            this._setMode(NavigationSensorMode.NAV1)
            return this.getNumber(NumberFormat.UInt16LE, 2)
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
            this._setMode(NavigationSensorMode.NAV1)
            return this.getNumber(NumberFormat.UInt16LE, 4)
        }


        /**
         * Sets a threshold value. For now, left and right share the same threshold
         * @param condition the near or detected condition
         * @param value the value threshold in cm
         */
        //% blockId=navigationSetThreshold block="set **navigation** %this|%condition|to %value"
        //% group="Calibration" blockGap=8 weight=80
        //% value.min=0 value.max=255
        //% this.fieldEditor="ports"
        setThreshold(condition: NavigationSensorEvent, value: number) {
            if (condition == NavigationSensorEvent.ObjectDetected)
                this.movementThreshold = value
            else
                this.promixityThreshold.setLowThreshold(value)
        }

        /**
         * Gets the threshold value. For now, left and right share the same threshold
         * @param condition the proximity condition
         */
        //% blockId=navigationGetThreshold block="**navigation** %this|%condition"
        //% group="Calibration" weight=79
        //% this.fieldEditor="ports"
        getProximityThreshold(condition: NavigationSensorEvent): number {
            if (condition == NavigationSensorEvent.ObjectDetected)
                return this.movementThreshold
            else
                return this.promixityThreshold.threshold(ThresholdState.Low)
            //return this.promixityThreshold.lowThreshold
        }
    }

    //% fixedInstance whenUsed block="4" jres=icons.port4
    export const navigation4: NavigationSensor = new NavigationSensor(4)

    //% fixedInstance whenUsed block="1" jres=icons.port1
    export const navigation1: NavigationSensor = new NavigationSensor(1)

    //% fixedInstance whenUsed block="2" jres=icons.port2
    export const navigation2: NavigationSensor = new NavigationSensor(2)

    //% fixedInstance whenUsed block="3" jres=icons.port3
    export const navigation3: NavigationSensor = new NavigationSensor(3)
}
