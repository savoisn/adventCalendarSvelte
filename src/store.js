import { writable } from 'svelte/store';

const DOORS = [];

const storedDoor = localStorage.getItem("door");
const { subscribe, set, update } = writable(storedDoor);
subscribe(value => {
    localStorage.setItem("door", value);
});

const addDoor = door => update(storeddoor => {
    console.log(storeddoor, door)
    if (storeddoor < door){
        return door
    }else{
        return storeddoor
    }
});

const reset = () => {
    set(0);
};

export default {
    subscribe,
    addDoor,
    reset
}
