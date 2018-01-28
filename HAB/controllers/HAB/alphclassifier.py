import os
import sys
import numpy as np
import tensorflow as tf

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# ----- Hyperparameters -----

BATCH_SZ = 1
LEARN_RATE = 0.01
HIDDEN_SZ = 30

INPUT_SZ = 61
OUTPUT_SZ = 26

TRAIN_ITER = 5000
TEST_ITER = 1000

# ----- Variables and Placeholders -----

weights_1 = tf.Variable(tf.random_normal([INPUT_SZ, HIDDEN_SZ], stddev=.1))
bias_1 = tf.Variable(tf.random_normal([HIDDEN_SZ], stddev=.1))
weights_2 = tf.Variable(tf.random_normal([HIDDEN_SZ, OUTPUT_SZ], stddev=.1))
bias_2 = tf.Variable(tf.random_normal([OUTPUT_SZ], stddev=.1))

inputs = tf.placeholder(tf.float32, [BATCH_SZ, INPUT_SZ])
ans = tf.placeholder(tf.float32, [BATCH_SZ, OUTPUT_SZ])

# ----- Computation ------

logit_1 = tf.matmul(inputs, weights_1) + bias_1
activation_1 = tf.nn.relu(logit_1)
logit_2 = tf.matmul(activation_1, weights_2) + bias_2
softmax = tf.nn.softmax(logit_2)

loss = tf.losses.softmax_cross_entropy(onehot_labels=ans, logits=logit_2)
train = tf.train.AdamOptimizer(LEARN_RATE).minimize(loss)

result = tf.argmax(softmax, 1)
aaa = tf.argmax(ans, 1)
numCorrect = tf.equal(tf.argmax(softmax, 1), tf.argmax(ans, 1))
accuracy = tf.reduce_mean(tf.cast(numCorrect, tf.float32))

# ----- Session -----

sess = tf.Session()
sess.run(tf.global_variables_initializer())


def trainer():
    saver = tf.train.Saver()
    try:
        saver.restore(sess, "alphmodel.ckpt")
    except:
        print("Model does not exist. Initializing new model...")
    else:
        print("Loaded model.")
        saver = tf.train.Saver()

    data_array = np.empty((0, INPUT_SZ + 1))
    for i in range(26):
        filename = str(i) + ".npy"
        loaded_array = np.load(filename)
        indexes = np.full((len(loaded_array), 1), i)
        loaded_array = np.append(loaded_array, indexes, 1)
        data_array = np.concatenate((data_array, loaded_array))
    np.random.shuffle(data_array)

    print("LENGTH OF DATA: " + str(len(data_array)))
    print("Training...")
    for i in range(len(data_array) / BATCH_SZ):
        print(i)
        data = data_array[i * BATCH_SZ:(i + 1) * BATCH_SZ, :-1]
        tmp_labels = data_array[i * BATCH_SZ:(i + 1) * BATCH_SZ, -1]
        tmp_labels = tmp_labels.astype(int)
        labels = np.zeros((BATCH_SZ, OUTPUT_SZ))
        labels[np.arange(BATCH_SZ), tmp_labels] = 1
        sess.run(train, feed_dict={inputs: data, ans: labels})

    saver.save(sess, "alphmodel.ckpt")
    print("Model saved as alphmodel.ckpt.")


def tester():
    saver = tf.train.Saver()
    try:
        saver.restore(sess, "alphmodel.ckpt")
    except:
        print("Model does not exist.")
        sys.exit(1)
    else:
        print("Loaded model.")

    print("Testing...")
    for i in range(26):
        filename = str(i) + ".npy"
        loaded_array = np.load(filename)
        labels = np.zeros((BATCH_SZ, OUTPUT_SZ))
        labels[:, i] = 1

        sum_acc = 0
        for j in range(len(loaded_array) / BATCH_SZ):
            data = loaded_array[j * BATCH_SZ:(j + 1) * BATCH_SZ]
            sum_acc += sess.run(accuracy, feed_dict={inputs: data, ans: labels})

        print("FINAL ACCURACY FOR " + str(i) + ":")
        print(str(float(sum_acc) / (len(loaded_array) / BATCH_SZ)))


def predictor():
    saver = tf.train.Saver()
    try:
        saver.restore(sess, "controllers/HAB/alphmodel.ckpt")
    except:
        print("Model does not exist.")
        sys.exit(0)
    else:
        print("Loaded model.")

    filename = 'controllers/HAB/predict.npy'
    loaded_array = np.load(filename)
    data = [loaded_array[0]]

    res = sess.run(result, feed_dict={inputs: data})
    print(chr(res[0]+65))


# ----- Execution -----

#trainer()
#tester()
predictor()
