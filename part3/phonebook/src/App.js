import { useState, useEffect } from "react";
import personsService from "./services/persons";
import "./index.css";

const Error = ({ message }) => {
  if (message === null) {
    return null;
  }
  return <div className="error">{message}</div>;
};

const Notification = ({ message }) => {
  if (message === null) {
    return null;
  }
  return <div className="notification">{message}</div>;
};

const Filter = ({ filter, setFilter }) => {
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };
  return (
    <div>
      Filter shown with: <input value={filter} onChange={handleFilterChange} />
    </div>
  );
};

const PhonebookInput = ({
  persons,
  setPersons,
  setNotificationMessage,
  setErrorMessage,
}) => {
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const addPerson = (event) => {
    event.preventDefault();
    const personObject = {
      name: newName,
      number: newNumber,
    };
    // Check if the name already exists (case insensitive)
    if (
      persons
        .map((person) => person.name.toLowerCase())
        .includes(newName.toLowerCase())
    ) {
      if (
        window.confirm(
          `${newName} is already added to phonebook, replace the old number with a new one?`
        )
      ) {
        const person = persons.find(
          (person) => person.name.toLowerCase() === newName.toLowerCase()
        );
        if (person === undefined) {
          setErrorMessage(
            `Information of ${newName} has already been removed from server`
          );
          setTimeout(() => {
            setErrorMessage(null);
          }, 5000);
          return;
        }
        const id = person.id;
        personsService
          .update(id, personObject)
          .then((returnedPerson) => {
            setPersons(
              persons.map((person) =>
                person.id !== id ? person : returnedPerson
              )
            );
			setPersons(
				persons.map((person) => (person.id !== id ? person : personObject))
			  );
			  setNotificationMessage(`Updated ${newName} number to ${newNumber}`);
			  setTimeout(() => {
				setNotificationMessage(null);
			  }, 5000);
			  setNewName("");
			  setNewNumber("");
			  return;
          })
          .catch((error) => {
            setErrorMessage(
              `Information of ${newName} has already been removed from server`
            );
            setTimeout(() => {
              setErrorMessage(null);
            }, 5000);
            setPersons(persons.filter((person) => person.id !== id));
			return;
          });
      }
      return;
    }
    setPersons(persons.concat(personObject));
    personsService.create(personObject).then((returnedPerson) => {
      setPersons(persons.concat(returnedPerson));
    });
    setNotificationMessage(`Added ${newName} to the phonebook`);
    setTimeout(() => {
      setNotificationMessage(null);
    }, 5000);
    setNewName("");
    setNewNumber("");
  };

  return (
    <form onSubmit={addPerson}>
      <div>
        Name: <input value={newName} onChange={handleNameChange} />
      </div>
      <div>
        Number: <input value={newNumber} onChange={handleNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

const Persons = ({ persons, deleteHandler }) => {
  return (
    <div>
      {persons.map((person) => (
        <div key={person.name}>
          {person.name} {person.number}{" "}
          <button id={person.id} onClick={deleteHandler}>
            delete
          </button>
        </div>
      ))}
    </div>
  );
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [filter, setFilter] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const personsToShow = persons.filter((person) =>
    person.name.toLowerCase().startsWith(filter.toLowerCase())
  );

  useEffect(() => {
    personsService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  const deleteHandler = (event) => {
    event.preventDefault();
    const id = Number(event.target.id);
    const person = persons.find((person) => person.id === id);
    if (person === undefined) {
      setErrorMessage(
        `Information of ${person.name} has already been removed from server`
      );
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return;
    }
    if (window.confirm(`Delete ${person.name}?`)) {
      personsService.deletePerson(id).then(() => {
        setPersons(persons.filter((person) => person.id !== id));
      });
      setPersons(persons.filter((person) => person.id !== id));
      setNotificationMessage(`Deleted ${person.name} from the phonebook`);
      setTimeout(() => {
        setNotificationMessage(null);
      }, 5000);
    }
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Error message={errorMessage} />
      <Notification message={notificationMessage} />
      <Filter filter={filter} setFilter={setFilter} />
      <h2>Add a new</h2>
      <PhonebookInput
        persons={persons}
        setPersons={setPersons}
        setNotificationMessage={setNotificationMessage}
        setErrorMessage={setErrorMessage}
      />
      <h2>Numbers</h2>
      <Persons persons={personsToShow} deleteHandler={deleteHandler} />
    </div>
  );
};

export default App;
