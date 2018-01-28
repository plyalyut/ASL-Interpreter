import os
import sys
import time
import inspect
import numpy as np
src_dir = os.path.dirname(inspect.getfile(inspect.currentframe()))
sys.path.insert(0, os.path.abspath(os.path.join(src_dir, '../lib/LeapSDK/lib')))

import Leap, thread, time

def print_frame(data, frame):
    finger_names = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']
    bone_names = ['Metacarpal', 'Proximal', 'Intermediate', 'Distal']

    if (len(frame.hands) == 2):
        print("ERROR: Have one hand only.")
        return

    # Get hands
    for hand in frame.hands:

        handType = "Left hand" if hand.is_left else "Right hand"

        print "  %s, id %d, position: %s" % (
            handType, hand.id, hand.palm_position)

        # Get the hand's normal vector and direction
        normal = hand.palm_normal
        direction = hand.direction

        # Calculate the hand's pitch, roll, and yaw angles
        print "  pitch: %f degrees, roll: %f degrees, yaw: %f degrees" % (
            direction.pitch * Leap.RAD_TO_DEG,
            normal.roll * Leap.RAD_TO_DEG,
            direction.yaw * Leap.RAD_TO_DEG)

        # Get arm bone
        arm = hand.arm
        print "  Arm direction: %s, wrist position: %s, elbow position: %s" % (
            arm.direction,
            arm.wrist_position,
            arm.elbow_position)

        # Get fingers
        for finger in hand.fingers:

            print "    %s finger, id: %d, length: %fmm, width: %fmm" % (
                finger_names[finger.type],
                finger.id,
                finger.length,
                finger.width)

            # Get bones
            for b in range(0, 4):
                bone = finger.bone(b)
                print "      Bone: %s, start: %s, end: %s, direction: %s" % (
                    bone_names[bone.type],
                    bone.prev_joint,
                    bone.next_joint,
                    bone.direction)

    if not frame.hands.is_empty:
        print ""


def save_frame(data, frame):
    if (len(frame.hands) != 1):
        print("ERROR: Need one hand.")

    #tmp = []
    hand = frame.hands[0]
    # wrist = hand.arm.wrist_position
    # direction = hand.direction
    # print(direction)
    #
    # for finger in hand.fingers:
    #     for b in range(0, 4):
    #         bone = finger.bone(b)
    #         bone_dir = bone.direction + direction
    #         print([bone_dir[0], bone_dir[1], bone_dir[2]])
    #         tmp.extend([bone_dir[0], bone_dir[1], bone_dir[2]])
    # data.append(tmp)
    # print(len(tmp))
    # print("Data recorded.")

    array1 = []
    arr = []
    for i in range(3):
        arr.append(hand.basis.x_basis[i])
    array1.append(arr)
    arr = []
    for i in range(3):
        arr.append(hand.basis.y_basis[i])
    array1.append(arr)
    arr = []
    for i in range(3):
        arr.append(hand.basis.z_basis[i])
    array1.append(arr)

    array1 = np.array(array1)
    array1 = np.linalg.inv(array1)
    #print array1
    v = []
    for finger in hand.fingers:
        # print "    %s finger, id: %d, length: %fmm, width: %fmm" % (
        #     self.finger_names[finger.type],
        #     finger.id,
        #     finger.length,
        #     finger.width)

        # Get bones
        for b in range(0, 4):
            array2 = []
            bone = finger.bone(b)
            for x in range(0,3):
                array2.append(bone.direction[x])
            array2 = np.array(array2)
            #print array2
            output = np.dot(array1, array2)
            for y in range(0,3):
                v.append(output[y])

            # print "      Bone: %s, start: %s, end: %s, direction: %s" % (
            #     self.bone_names[bone.type],
            #     bone.prev_joint,
            #     bone.next_joint,
            #     bone.direction)
    v.append(hand.palm_normal.roll)
    v = np.array(v)
    data.append(v)
    print "Data Recorded"

class SampleListener(Leap.Listener):

    def on_connect(self, controller):
        print "Connected"


    def on_frame(self, controller):
        data = []
        name = "controllers/HAB/predict"
        frame = controller.frame()
        save_frame(data, frame)
        arr_to_save = np.array(data)
        np.save(name, arr_to_save)

def main():
    listener = SampleListener()
    controller = Leap.Controller()
    controller.set_policy(Leap.Controller.POLICY_BACKGROUND_FRAMES)
    controller.add_listener(listener)
    time.sleep(0.5)
    controller.remove_listener(listener)
    # data = []
    # name = "predict"
    # time.sleep(1)
    # frame = controller.frame()
    # save_frame(data, frame)
    # arr_to_save = np.array(data)
    # np.save(name, arr_to_save)
    # print("Saved as " + name + ".npy")
    # sys.exit(0)

main()
