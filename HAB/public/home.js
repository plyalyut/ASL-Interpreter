function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getParse() {

    hands = currentFrame.hands;
    if (hands.length != 1) {
      console.log("Show one hand only.");
      return;
    }

    console.log(hands[0].type);

    const params = {
      type: hands[0].type,
    };

    controller.disconnect();
    $('#wait-modal').css('opacity', '100');
    await sleep(500);

    $.get("/parse", params, responseJSON => {
        if (responseJSON['status'] == 'success') {
            $("#result-body").append(responseJSON['data']);
        } else {
            alert(responseJSON['data']);
        }
    });
    await sleep(500);

    $('#wait-modal').css('opacity', '0');
    controller.connect();
}

// Waits for DOM to load before running
$(document).ready(() => {

    const $button = $("#interpret-button");

    $button.click(event => {
        getParse();
    });
});
