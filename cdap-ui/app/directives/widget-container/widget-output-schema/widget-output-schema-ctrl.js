/*
 * Copyright © 2017 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
*/
angular.module(PKG.name + '.commons')
  .controller('MyOutputSchemaCtrl', function($scope, GLOBALS) {
    let vm = this;

    const parseOutputSchema = () => {
      vm.outputSchemas = $scope.node.outputSchema
        .map((node) => {
          var schema = node.schema;
          if (typeof schema === 'string') {
            try {
              schema = JSON.parse(schema);
            } catch(e) {
              schema = {
                'name': GLOBALS.schemaRecordName,
                'type': 'record',
                'fields': []
              };
            }
          }
          return {
            name: node.name,
            schema: schema
          };
        });
      };

    this.currentIndex = 0;

    parseOutputSchema();

    $scope.$watch('node.outputSchema', () => {
      parseOutputSchema();
    });

    this.onOutputSchemaChange = (newOutputSchema, index) => {
      $scope.node.outputSchema[index].schema = newOutputSchema;
    };
  });
