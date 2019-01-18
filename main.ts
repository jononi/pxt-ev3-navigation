sensors.navigation1.onEvent(NavigationSensorEvent.ObjectNear, function () {
    music.playSoundEffect(sounds.systemGeneralAlert)
})
forever(function () {
    brick.showValue("left", sensors.navigation1.distanceLeft(), 1)
    brick.showValue("right", sensors.navigation1.distanceRight(), 2)
    brick.showValue("heading", sensors.navigation1.heading(), 3)
    pause(1000)
})
