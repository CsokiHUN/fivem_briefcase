const ESX = exports.es_extended.getSharedObject();

let lastMoney = false;
let handObject = false;

setInterval(() => {
  const PlayerData = ESX.GetPlayerData();

  if (!PlayerData) {
    return;
  }

  let moneyAccount = PlayerData.accounts.filter((element) => {
    return element.name === 'money';
  });

  if (moneyAccount && moneyAccount.length > 0) {
    moneyAccount = moneyAccount[0];
  }

  if (!lastMoney || lastMoney != moneyAccount.money) {
    emit('onClientMoneyChange', lastMoney, moneyAccount.money);
    lastMoney = moneyAccount.money;
  }

  if (handObject) {
    const playerPed = PlayerPedId();
    const vehicle = GetVehiclePedIsIn(playerPed, false);
    if (vehicle > 0) {
      SetEntityVisible(handObject, false);
    } else {
      if (!IsEntityVisible(handObject)) {
        SetEntityVisible(handObject, true);
      }
    }
  }
}, 1000);

on('onClientMoneyChange', async (oldValue, newValue) => {
  if (newValue >= Config.limit) {
    if (handObject) {
      return;
    }

    const modelHash = GetHashKey(Config.model);
    await loadModel(modelHash);
    const playerPed = PlayerPedId();

    handObject = CreateObject(modelHash, 0, 0, 0, true, true, true);

    AttachEntityToEntity(
      handObject,
      playerPed,
      GetPedBoneIndex(playerPed, 60309),
      0.1,
      0,
      0,
      70,
      0,
      -90,
      true,
      true,
      false,
      true,
      1,
      true
    );
  } else {
    removeCase();
  }
});

function removeCase() {
  if (handObject) {
    DeleteEntity(handObject);
  }

  handObject = null;
}

on('onResourceStop', (resourceName) => {
  console.log(resourceName, 'stopped');
  if (resourceName != GetCurrentResourceName()) {
    return;
  }

  removeCase();
});

// UTILS
const loadModel = (model) => {
  return new Promise((resolve, reject) => {
    if (HasModelLoaded(model)) {
      return resolve();
    }

    RequestModel(model);
    const maxAttempt = 50;
    let attempts = 0;

    const load = setInterval(() => {
      if (HasModelLoaded(model)) {
        clearInterval(load);
        return resolve();
      }

      if (++attempts > maxAttempt) {
        clearInterval(load);
        reject(new Error(`failed to load a model`));
      }
    }, 50);
  });
};
