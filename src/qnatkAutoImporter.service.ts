import { Inject, Injectable } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { ValidationException } from './Exceptions/ValidationException';
import { ActionDTO, ActionListDTO } from './dto/ActionListDTO';
import * as _ from 'lodash';
import { Model, Table, Column, HasMany, Sequelize } from 'sequelize-typescript';


const operators = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $is: Op.is,
  $in: Op.in,
  $notIn: Op.notIn,
  $like: Op.like,
  $notLike: Op.notLike,
  $viLike: Op.iLike,
  $notILike: Op.notILike,
  $startsWith: Op.startsWith,
  $endsWith: Op.endsWith,
  $substring: Op.substring,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col,
  $placeholder: Op.placeholder,
};

export default operators;

@Injectable()
export class QnatkAIService {
  constructor(
    private sequelize: Sequelize,
    @Inject('MODEL_ACTIONS')
    private modelActions: Record<string, ActionListDTO>[] = [],
) {}

    async findAndUpdateOrCreate(
        baseModel: string, 
        body: any, 
        primaryKey: string | number, 
        primaryField: string, 
        transaction: Transaction) {
        try {
            // return await this.sequelize.model(baseModel).create(body, {
            //     transaction,
            // });
            const modelInstance = this.sequelize.model(baseModel);
            const [record, created] = await modelInstance.findOrCreate({
              where: {
                [primaryField]: primaryKey,
            },
              defaults: body,
              transaction,
            });
      
            if (!created) {
              // If the record was found and not created, update its properties
              await record.update(body, { transaction });
            }
      
            return record;
        } catch (err: any) {
            console.log('err', err);
            // throw err;
            throw new ValidationException({
                Error: [err.message],
            });
        }
    }

    async findOrCreate(
        baseModel: string, 
        body: any, 
        $qnatk_find_options: any,
        transaction: Transaction) {
        try {
            let scopeName: string;
            let plainCondition: object ;
            if ($qnatk_find_options.modelscope !== undefined) {
                if ($qnatk_find_options.modelscope === false)  scopeName ='unscope';
                else scopeName = $qnatk_find_options.modelscope;
              }
              if ($qnatk_find_options.modeloptions &&
                  $qnatk_find_options.modeloptions.where)
                {
                    plainCondition = { where: $qnatk_find_options.modeloptions };
                }    

            const [record, created] = await this.sequelize.model(baseModel).scope(scopeName).findOrCreate({
           // plainCondition,
           where : {},
              defaults: body,
             // scope: scopeName,
              transaction,
            });
            return record;
        } catch (err: any) {
            console.log('err', err);
            throw new ValidationException({
                Error: [err.message],
            });
        }
    }

    async alwaysCreate(baseModel: string, body: any, transaction: Transaction) {
        body = JSON.parse(body.data);
        try {
            return await this.sequelize.model(baseModel).bulkCreate(body, {
                transaction,
            });
        } catch (err: any) {
            console.log('err', err);
            // throw err;
            throw new ValidationException({
                Error: [err.message],
            });
        }
    }

    async autoImportItem(
      model: any,
      item: any,
      Models: any,
      AdditionalWhere: any = {},
      relation: string = 'none',
      transaction: any
    ): Promise<any> {
      const itemOrig = _.cloneDeep(item);
      let qnatkDataHandle = 'alwaysCreate';
      let qnatkFindOptions: any;
      let qnatkCacheRecords = true;
      let qnatkUpdateData = item;
      if (item.$qnatk_data_handle) {
        qnatkDataHandle = item.$qnatk_data_handle;
        delete item.$qnatk_data_handle;
      }
      if (item.$qnatk_find_options) {
        qnatkFindOptions = item.$qnatk_find_options;
        delete item.$qnatk_find_options;
      }
      if (item.$qnatk_cache_records) {
        qnatkCacheRecords = item.$qnatk_cache_records;
        delete item.$qnatk_cache_records;
      }
      if (item.$qnatk_update_data) {
        qnatkUpdateData = item.$qnatk_update_data;
        delete item.$qnatk_update_data;
      }
      if (item.$qnatk_find_options) {
        qnatkFindOptions = item.$qnatk_find_options;
        delete item.$qnatk_find_options;
      }
      if (item.qnatk_update_data) {
        qnatkUpdateData = item.$qnatk_update_data;
        delete item.$qnatk_update_data;
      }

      if (qnatkFindOptions && qnatkFindOptions.modelscope && qnatkFindOptions.modelscope !== 'undefined') {
        if (qnatkFindOptions.modelscope === false) model = model.unscoped();
        else model = model.scope(qnatkFindOptions.modelscope);
      }
      //Fetch belongsTo, hasMany, and belongsToMany separately and just leave the data for the Model
      const associations = this.getAssociations(model);
      let itemBelongsTo = associations.filter(
        (r) => r.associationType === 'BelongsTo'
      );
      itemBelongsTo = itemBelongsTo.map((i) => {
        if (!i.as) i.as = i.name.singular;
        return i;
      });

      let itemHasMany = associations.filter(
        (r) => r.associationType === 'HasMany'
      );
      itemHasMany = itemHasMany.map((i) => {
        if (!i.as) i.as = i.name.plural;
        return i;
      });

      let itemBelongsToMany = associations.filter(
        (r) => r.associationType === 'BelongsToMany'
      );
      itemBelongsToMany = itemBelongsToMany.map((i) => {
        if (!i.as) i.as = i.name.plural;
        return i;
      });
      // perform the same recursive with belongsTo first and save their foreignKeys for this table
      for (let index = 0; index < itemBelongsTo.length; index++) {
          const itemBelongsToRelation = itemBelongsTo[index];
          if (_.has(itemOrig, itemBelongsToRelation.as)) {
              itemBelongsTo[index]['item'] = await this.autoImportItem(
              Models[itemBelongsToRelation.model],
              itemOrig[itemBelongsToRelation.as],
              Models,
              undefined,
              undefined,
              transaction
              ).catch((err) => {
              throw err;
              });
              item[itemBelongsToRelation.foreignKey] = itemBelongsTo[index]['item'][model.autoIncrementAttribute];

              if (itemBelongsTo && itemBelongsTo[index]['item'] && relation != 'BelongsToMany'){
                  item[itemBelongsToRelation.foreignKey.name] = item[itemBelongsToRelation.foreignKey];
                  delete item[itemBelongsToRelation.as];
              }

              // when finding this record, do we want the belongsTo id part of the where condition ? below code
              if (
              relation == 'BelongsToMany' ||
              (qnatkFindOptions.modeloptions &&
                  qnatkFindOptions.modeloptions.where &&
                  qnatkFindOptions.modeloptions.where[
                  itemBelongsToRelation.foreignKey
                  ] === true)
              ){
                  AdditionalWhere[itemBelongsToRelation.foreignKey] = item[itemBelongsToRelation.foreignKey];
                  delete item[itemBelongsToRelation.as];
              }    
          }
      }
      // get belongsToMany item ready by solving all other models, once we save this model we will fill our ID and run the loop again
      for (let index = 0; index < itemBelongsToMany.length; index++) {
        const thisBelongsToManyRelation = itemBelongsToMany[index];
        if (_.has(itemOrig, thisBelongsToManyRelation.as)) {
          delete item[thisBelongsToManyRelation.as];
        }
      }

      for (let index = 0; index < itemHasMany.length; index++) {
        const thisHasManyRelation = itemHasMany[index];
        if (_.has(itemOrig, thisHasManyRelation.as)) {
          delete item[thisHasManyRelation.as];
        }
      }
      // do the data for this model, received the ids: Clean everything that does not belong to model fields first
      item = _.pick(item, _.map(model.rawAttributes, 'fieldName'));
      if (!item.qnatk_update_data) qnatkUpdateData = item;
      let sanitizedModelOptions: any;
      sanitizedModelOptions = { where: { ...item } };
      let plainCondition = sanitizedModelOptions;
      if (qnatkFindOptions && qnatkFindOptions.modeloptions) {
        plainCondition = { where: qnatkFindOptions.modeloptions };
        let tSentMo = {
          where: this.senitizeModelOptions(
            qnatkFindOptions.modeloptions,
            model,
            Models
          ),
        };
        for (const [field, value] of Object.entries(tSentMo.where)) {
          if (value === true && _.has(sanitizedModelOptions.where, field)) {
            tSentMo.where[field] = sanitizedModelOptions.where[field];
            plainCondition.where[field] = sanitizedModelOptions.where[field];
          }
        }
        sanitizedModelOptions = tSentMo;
      }
      if (!_.isEmpty(AdditionalWhere)) {
        if (!sanitizedModelOptions.where) sanitizedModelOptions.where = {};
        sanitizedModelOptions.where = {
          ...sanitizedModelOptions.where,
          ...AdditionalWhere,
        };
        plainCondition.where = {
          ...plainCondition.where,
          ...AdditionalWhere,
        };
      }
      if (
        relation === 'BelongsToMany' &&
        (!qnatkFindOptions.modeloptions ||
          !qnatkFindOptions.modeloptions.where)
      ) {
        sanitizedModelOptions = { where: AdditionalWhere };
        plainCondition = { where: AdditionalWhere };
      }
      // sanitizedModelOptions.transaction = transaction;
      let t = undefined;
      switch (qnatkDataHandle.toLowerCase()) {
        case 'alwayscreate':
          item = await model.create(item, { transaction, individualHooks: true }).catch((err) => {
            throw err;
          });
          break;
        case 'findorcreate':
          sanitizedModelOptions.transaction = transaction;
          t = await model.findOne(sanitizedModelOptions).catch((err) => {
            throw err;
          });
          if (!t) {
            t = await model.create(item, { transaction, individualHooks: true }).catch((err) => {
              throw err;
            });
          }
          item = t;
          break;
        case 'findandupdateall':
          sanitizedModelOptions.transaction = transaction;
          sanitizedModelOptions.individualHooks = true;
          t = await model.update(qnatkUpdateData, sanitizedModelOptions).catch((err) => {
            throw err;
          });
          break;
        case 'findanddeleteall':
          // TODO
          break;
        case 'findandupdateorcreate':
          sanitizedModelOptions.transaction = transaction;
          t = await model.findOne(sanitizedModelOptions).catch((err) => {
            throw err;
          });
          if (!t) {
            t = await model.create(item, { transaction }).catch((err) => {
              throw err;
            });
          } else {
            let updateRequired = false;
            for (const [field, value] of Object.entries(qnatkUpdateData)) {
              if (item[field] !== t.get(field)) {
                t.set(field, value);
                updateRequired = true;
              }
            }
            if (updateRequired) t = await t.save({ transaction }).catch((err) => {
              throw err;
            });
          }
          item = t;
          break;
        case 'findtoassociate':
          sanitizedModelOptions.transaction = transaction;
          t = await model.findOne(sanitizedModelOptions).catch((err) => {
            throw err;
          });
          if (t) item = t;
          else {
            throw new Error(JSON.stringify(plainCondition) + ' not found');
          }
          break;
        case 'associateiffound':
          sanitizedModelOptions.transaction = transaction;
          t = await model.findOne(sanitizedModelOptions).catch((err) => {
            throw err;
          });
          if (t) item = t;
          break;
        default:
          throw new Error(
            qnatkDataHandle +
              ' is not an accepted value at ' +
              JSON.stringify(item)
          );
      }

      for (let index = 0; index < itemHasMany.length; index++) {
        const thisHasManyRelation = itemHasMany[index];
        if (_.has(itemOrig, thisHasManyRelation.as)) {
          for (let j = 0; j < itemOrig[thisHasManyRelation.as].length; j++) {
            let thisItemDetails = itemOrig[thisHasManyRelation.as][j];
            let idMerge = {};
            idMerge[thisHasManyRelation.foreignKey] =
              item[model.autoIncrementAttribute];
            thisItemDetails = { ...thisItemDetails, ...idMerge };
            let addWhere = idMerge;
            await this.autoImportItem(
              Models[thisHasManyRelation.model],
              thisItemDetails,
              Models,
              addWhere,
              undefined,
              transaction
            ).catch((err) => {
              throw err;
            });
          }
          delete item[thisHasManyRelation.as];
        }
      }
      // do the hasMany and belongsToMany now
      // get belongsToMany item ready by solving all other models, once we save this model we will fill our ID and run the loop again
      for (let index = 0; index < itemBelongsToMany.length; index++) {
        const thisBelongsToManyRelation = itemBelongsToMany[index];
        if (_.has(itemOrig, thisBelongsToManyRelation.as)) {
          for (let j = 0; j < itemOrig[thisBelongsToManyRelation.as].length; j++) {
            let thisItemDetails = itemOrig[thisBelongsToManyRelation.as][j];
            let idMerge = {};
            idMerge[thisBelongsToManyRelation.foreignKey] =
              item[model.autoIncrementAttribute];
            thisItemDetails = { ...thisItemDetails, ...idMerge };
            let addWhere = idMerge;
            await this.autoImportItem(
              Models[thisBelongsToManyRelation.through.model],
              thisItemDetails,
              Models,
              addWhere,
              'BelongsToMany',
              transaction
            ).catch((err) => {
              throw err;
            });
          }
          delete item[thisBelongsToManyRelation.as];
        }
      }

      return item;
    }

    getAssociations(model: any): any[] {
    const associations = [];
    Object.keys(model.associations).forEach((key) => {
      if (model.associations[key].hasOwnProperty('options')) {
        delete model.associations[key].options.sequelize;
        let opt: any;
         opt = _.pick(model.associations[key].options, [
          'foreignKey',
          'as',
          'validate',
          'indexes',
          'name',
          'onDelete',
          'onUpdate',
        ]);
        opt.associationType = model.associations[key].associationType;
        opt.model = model.associations[key].target.name;
        if (model.associations[key].through) {
          opt.through = {
            model: model.associations[key].through.model.name,
          };
        }
        associations.push(opt);
      }
    });
     return associations;
    }  

    getScopes(model: any): any {
    // Omit 'sequelize' from options
    delete model.options.sequelize;
    // Pick relevant options and create a new object
    const opt = _.pick(model.options, ['defaultScope', 'scopes']);
    return opt;
    }

    senitizeModelOptions(options: any, model: any, Models: any, skipIdInsert?: boolean): any {
      if (_.has(options, 'attributes') &&
        !options.attributes.includes(model.autoIncrementAttribute) &&
        !skipIdInsert) {
        options.attributes.push(model.autoIncrementAttribute);
      }

      this.replaceIncludeToObject(options, Models);

      return options;
    }

    replaceIncludeToObject(obj: any, Models: any): void {
      const sequelize = Models.sequelize;

      if (Array.isArray(obj)) {
        for (let index = 0; index < obj.length; index++) {
          const element = obj[index];
          this.replaceIncludeToObject(element, Models);
          if (typeof element === 'object' && _.has(element, 'fn') && _.has(element, 'col')) {
            if (element.as === false) {
              obj[index] = sequelize.fn(element.fn, sequelize.col(element.col));
            } else {
              obj[index] = [
                sequelize.fn(element.fn, sequelize.col(element.col)),
                element.as ? element.as : element.fn + '_' + element.col,
              ];
            }
          } else if (typeof element === 'object' && _.has(element, 'col')) {
            obj[index] = sequelize.col(element.col);
          }
        }
      } else if (typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          if (key === 'model') {
            // handle scopes from text
            obj.model = sequelize.model(value);
            if (_.has(obj, 'scope')) {
              if (obj.scope === false) {
                obj.model = obj.model.unscoped();
              } else {
                obj.model = obj.model.scope(obj.scope);
              }
            }
          }

          // Assuming operators is an imported object with Sequelize operators
          if (_.keys(operators).includes(key)) {
            this.replaceOperators(obj, key, value);
          }

          if (typeof value === 'object' && value !== null) {
            this.replaceIncludeToObject(value, Models);
          }
        }
      }

      console.log(obj);
    }

    replaceOperators(object: any, k: string, v: any): void {
      switch (k) {
        case '$eq':
          delete object[k];
          return (object[Op.eq] = v);
        case '$ne':
          delete object[k];
          return (object[Op.ne] = v);
        case '$gte':
          delete object[k];
          return (object[Op.gte] = v);
        case '$gt':
          delete object[k];
          return (object[Op.gt] = v);
        case '$lte':
          delete object[k];
          return (object[Op.lte] = v);
        case '$lt':
          delete object[k];
          return (object[Op.lt] = v);
        case '$not':
          delete object[k];
          return (object[Op.not] = v);
        case '$is':
          delete object[k];
          return (object[Op.is] = v);
        case '$in':
          delete object[k];
          return (object[Op.in] = v);
        case '$notIn':
          delete object[k];
          return (object[Op.notIn] = v);
        case '$like':
          delete object[k];
          return (object[Op.like] = v);
        case '$notLike':
          delete object[k];
          return (object[Op.notLike] = v);
        case '$notILike':
          delete object[k];
          return (object[Op.notILike] = v);
        case '$startsWith':
          delete object[k];
          return (object[Op.startsWith] = v);
        case '$endsWith':
          delete object[k];
          return (object[Op.endsWith] = v);
        case '$substring':
          delete object[k];
          return (object[Op.substring] = v);
        case '$regexp':
          delete object[k];
          return (object[Op.regexp] = v);
        case '$notRegexp':
          delete object[k];
          return (object[Op.notRegexp] = v);
        case '$iRegexp':
          delete object[k];
          return (object[Op.iRegexp] = v);
        case '$notIRegexp':
          delete object[k];
          return (object[Op.notIRegexp] = v);
        case '$between':
          delete object[k];
          return (object[Op.between] = v);
        case '$notBetween':
          delete object[k];
          return (object[Op.notBetween] = v);
        case '$overlap':
          delete object[k];
          return (object[Op.overlap] = v);
        case '$contains':
          delete object[k];
          return (object[Op.contains] = v);
        case '$contained':
          delete object[k];
          return (object[Op.contained] = v);
        case '$adjacent':
          delete object[k];
          return (object[Op.adjacent] = v);
        case '$strictLeft':
          delete object[k];
          return (object[Op.strictLeft] = v);
        case '$strictRight':
          delete object[k];
          return (object[Op.strictRight] = v);
        case '$noExtendRight':
          delete object[k];
          return (object[Op.noExtendRight] = v);
        case '$noExtendLeft':
          delete object[k];
          return (object[Op.noExtendLeft] = v);
        case '$and':
          delete object[k];
          return (object[Op.and] = v);
        case '$or':
          delete object[k];
          return (object[Op.or] = v);
        case '$any':
          delete object[k];
          return (object[Op.any] = v);
        case '$all':
          delete object[k];
          return (object[Op.all] = v);
        case '$values':
          delete object[k];
          return (object[Op.values] = v);
        case '$col':
          delete object[k];
          return (object[Op.col] = v);
        case '$placeholder':
          delete object[k];
          return (object[Op.placeholder] = v);
      }
    }
}
