import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";

actor {
  type Question = {
    id : Nat;
    text : Text;
    questionType : Text;
    difficulty : Text;
  };

  type Session = {
    id : Nat;
    subject : Text;
    notes : Text;
    questions : [Question];
    createdAt : Int;
  };

  module Session {
    public func compareByCreatedAt(session1 : Session, session2 : Session) : Order.Order {
      Int.compare(session2.createdAt, session1.createdAt);
    };
  };

  var nextId = 0;
  let sessions = Map.empty<Nat, Session>();

  func generateQuestionId() : Nat {
    let id = nextId;
    nextId += 1;
    id;
  };

  func generateQuestions(subject : Text, _notes : Text) : [Question] {
    [
      {
        id = generateQuestionId();
        text = "What is the main concept of " # subject # "?";
        questionType = "Short Answer";
        difficulty = "Easy";
      },
      {
        id = generateQuestionId();
        text = "Explain the importance of " # subject # ".";
        questionType = "Essay";
        difficulty = "Medium";
      },
      {
        id = generateQuestionId();
        text = "True or False: " # subject # " is related to science.";
        questionType = "Short Answer";
        difficulty = "Easy";
      },
      {
        id = generateQuestionId();
        text = "List three key points about " # subject # ".";
        questionType = "Short Answer";
        difficulty = "Medium";
      },
      {
        id = generateQuestionId();
        text = "Describe a real-world application of " # subject # ".";
        questionType = "Essay";
        difficulty = "Hard";
      },
      {
        id = generateQuestionId();
        text = "Which of the following best describes " # subject # "?";
        questionType = "Multiple Choice";
        difficulty = "Easy";
      },
      {
        id = generateQuestionId();
        text = "Compare and contrast " # subject # " with another concept.";
        questionType = "Essay";
        difficulty = "Hard";
      },
      {
        id = generateQuestionId();
        text = "What are the challenges associated with " # subject # "?";
        questionType = "Short Answer";
        difficulty = "Medium";
      },
      {
        id = generateQuestionId();
        text = "Multiple Choice Question about " # subject # ".";
        questionType = "Multiple Choice";
        difficulty = "Medium";
      },
      {
        id = generateQuestionId();
        text = "Summarize the key lessons from " # subject # ".";
        questionType = "Short Answer";
        difficulty = "Easy";
      },
    ];
  };

  public shared ({ caller }) func createSession(subject : Text, notes : Text) : async Session {
    if (subject.size() == 0) { Runtime.trap("Subject cannot be empty") };
    let questions = generateQuestions(subject, notes);
    let session : Session = {
      id = nextId;
      subject;
      notes;
      questions;
      createdAt = Time.now();
    };
    sessions.add(session.id, session);
    nextId += 1;
    session;
  };

  public query ({ caller }) func getSessions() : async [Session] {
    sessions.values().toArray().sort(Session.compareByCreatedAt);
  };

  public query ({ caller }) func getSession(id : Nat) : async Session {
    switch (sessions.get(id)) {
      case (null) { Runtime.trap("Session not found") };
      case (?session) { session };
    };
  };

  public shared ({ caller }) func deleteSession(id : Nat) : async Bool {
    if (sessions.containsKey(id)) {
      sessions.remove(id);
      true;
    } else {
      false;
    };
  };
};
