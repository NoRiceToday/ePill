package com.doccuty.epill.condition;


import com.doccuty.epill.model.util.ConditionCreator;
import com.doccuty.epill.user.User;
import com.doccuty.epill.user.UserService;
import de.uniks.networkparser.Deep;
import de.uniks.networkparser.Filter;
import de.uniks.networkparser.IdMap;
import de.uniks.networkparser.json.JsonArray;
import de.uniks.networkparser.json.JsonObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;

/**
 * HTTP endpoint for a post-related HTTP requests.
 */
@RestController
@RequestMapping("/condition")
public class ConditionController {

    @Autowired
    private ConditionService service;

    @Autowired
    private UserService userService;

    @RequestMapping("/all")
    public ResponseEntity<JsonObject> getAllConditions() {

        HashSet<Condition> set = service.getAllConditions();

        IdMap map = ConditionCreator.createIdMap("");
        map.withFilter(Filter.regard(Deep.create(2)));

        JsonObject json = new JsonObject();
        JsonArray conditionArray = new JsonArray();

        for (Condition condition : set) {
            conditionArray.add(map.toJsonObject(condition));
        }

        json.add("value", conditionArray);


        return new ResponseEntity<>(json, HttpStatus.OK);
    }

    @RequestMapping(value = {"/{id}"}, method = RequestMethod.GET)
    public ResponseEntity<JsonObject> getConditionById(@PathVariable(value = "id") int id) {

        Condition condition = service.getConditionById(id);

        IdMap map = ConditionCreator.createIdMap("");
        map.withFilter(Filter.regard(Deep.create(2)));

        JsonObject json = new JsonObject();
        json.add("value", map.toJsonObject(condition));

        return new ResponseEntity<>(json, HttpStatus.OK);
    }


    @RequestMapping(value = "/save", method = RequestMethod.POST)
    public ResponseEntity<Object> addCondition(@RequestBody String name) {
        // A pragmatic approach to security which does not use much framework-specific magic. While other approaches
        // with annotations, etc. are possible they are much more complex while this is quite easy to understand and
        // extend.
        if (userService.isAnonymous()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        //the name always ends on "=", which is not desired.
        if (name != null && name.length() > 0 && name.charAt(name.length() - 1) == '=') {
            name = name.substring(0, name.length() - 1);
        }

        Condition repoCond = service.getConditionByName(name);
        User user = userService.getUserById(userService.getCurrentUser().getId());

        if (repoCond == null) {
            repoCond = new Condition();
            repoCond.setName(name);
            service.addCondition(repoCond);
        }

        user.withCondition(repoCond);
        userService.updateUserData(user);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}