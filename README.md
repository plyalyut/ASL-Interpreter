## Inspiration
Around 2 million people in the united states cannot understand normal speech. These people experience difficulties on a day to day basis because so much of our word is based off of auditory communication. ASL was created to provide these same people a way to communicate with one another without having to rely on hearing. While ASL was a breakthrough in the deaf communities, the vast majority of the US population does not understand sign language. We decided to tackle this problem by creating an ASL interpreter that lets people trained in sign language express their thoughts without having a live in-person interpreter.

## What it does
Briefly speaking, the application captures your hand position through the Leap motion tracker, then outputs the corresponding alphanumeric character based on the hand position data and the model it has learned through machine learning.

## How I built it
The project is comprised of three main parts:

Recording data. Because we were going to train an ASL Interpreter through deep learning, we were going to need a lot of data (different hand poses, orientations, hand sizes, etc. for each alphanumeric sign language). Specifically, we needed a program that could 1) rapidly collect hand / finger position data from Leap motion tracker, and 2) process it into a vector (preferably with as few dimensions as possible while having as much information as possible) to feed into the deep learning model. The program was built using the Python API of Leap; building the first part was trivial, but the second part not necessarily so. After discussion, we decided to take the basis vectors of the hands and the unit vectors of the fingers, such that hand gestures would be deemed equal regardless of the hand's position or orientation.

The classifier. Here we used Tensorflow to construct a two-layer feed-forward neural network with 61 inputs (a vector provided by the recorder above) and 36 outputs (26 alphabets + 10 numerical digits). We first tested the network with 10 numerical digits to ensure that the model was working as expected, then gradually expanded the number to 26 (alphabets only), and finally 36 (both). The classifier was fairly straightforward in terms of its architecture, and thus was fast to train and provided reasonable results of 60 - 99% accuracy for the outputs.

The front-end. We decided to use a node.js based web-app to create a user-friendly interface for interacting with the classifier. Basic libraries such as Bootstrap and jQuery was used to quickly construct the look and functionality of the application. When the "Record" button is pressed in the website, a GET request is sent to the server. Within the server, a modified version of the recorder is run from the server where a single "snapshot" of the person's hand visible in the Leap mobile tracker is saved. This snapshot is then fed to the classifier, which its result is then returned as a response back to the front-end. Furthermore, LeapJS was used to create a hand simulator within the web app, so that users can see if and how their hands are being sensed in the Leap motion tracker.

## Challenges I ran into
Some notable challenges included:

Generating a useful dataset. Firstly, when formatting the data obtained in the recorder to inputs for the neural net, we had to figure out which information was important and which was not, as too many variables would have required a lot more data, while too few variables would have compromised the accuracy of the neural net. As we went through several iterations of "formatting" the raw data into various kinds of inputs, we had to therefore produce several sets of data for each, to train and test each time if the new format produced better results. Secondly, even after settling on the final format of hand / finger unit vectors, we still had to produce a lot of data for each alphanumeric character (thousands for each), which consumed some time even with rapid data collection from the recorder. Finally, we had to ensure that we do not "overfit" for any specific type of hand, so we had to collect hand data from many people within the hackathon.

Limitations within the Leap motion tracker. There were a few issues with the Leap motion tracker that restricted our production workflow and/or our accuracy in training our model. Firstly, the Leap Python API required Python of 2.7 while Tensorflow was restricted to 3.5+ on windows, making a few members unable to run some of the programs and thus forced to rotate computers and be restricted to working on specific programs within their own computers. Furthermore, while highly accurate in most situations, the Leap motion tracker still had difficulty replicating some ASL characters (e.g. some ASL characters pairs such as 'm' and 'n', and 'a' and '0', had the Leap motion tracker show virtually the same hand position). Finally, the Leap motion tracker only allows one process to use the tracker at the same time, which was an issue when both the web-app and the recorder tried to access the motion tracker; this was resolved by forcibly pausing the web-app's accessing to the motion tracker when the user presses the "record" button.

## Accomplishments that I'm proud of
One of the biggest challenges that we ran into was making sure hand rotations and position changes didn’t have an effect type of hand sign represented. For example, the number 2 is represented with your index finger and your middle finger pointing directly up. It doesn't matter which position you choose to represent your 2 so long as those two fingers are up. Rotation also doesn’t matter, a two slightly rotated is the same as a two upright. In order to solve this problem, we decided to represent every bone as a “direction” and use a change of basis from linear algebra to get everything to a consistent frame of reference. We then stored each of those bone directions in an array that we passed into our ML algorithm. The ML algorithm was a simple double linear layer neural network with hidden size of 30, and the algorithm predicts the gesture with lowest loss value. After training the model using many different hands and frames of rotation, we were able to get very consistent output.

## What I learned
The machine learning algorithm was relatively simple and fast, but the data we fed to the algorithm was often inconsistent. This was the result of the inaccuracy of the leap motion combined with the small differences in joint positioning required for sign language. Struggling with data collected in a tightly combined environment, we learned how difficult it is to manage and select wanted features from real world data. Data extraction also proved to be a very enriching experience. When working with a machine learning algorithm, the bigger your input vector, the more data you will have to collect. So one of the most important parts of the process was identifying the important data and then representing it in the least amount of information as possible. Overall, we were able to reduce the hand which contains over 200 pieces of relevant information, to an array of 60 values.

## What's next for ASL Interpreter
The ASL Interpreter has a long way to go before market adoption simply, due to the leap motion’s inaccuracy. We are planning to experiment with other devices like the Myo and the Kinect to record the relevant information with more precision. Furthermore, we also have plans to create an interactive environment where people can actively participate to train the data (people correcting the machine if it produces an incorrect output, etc.)

## Built With
css3
html5
javascript
leap-motion
node.js
python
tensorflow
